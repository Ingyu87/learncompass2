import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import admin from "firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FAILS = 5;
const LOCK_MS = 5 * 60 * 1000;
const SESSION_MS = 12 * 60 * 60 * 1000;

class HttpError extends Error {
  status: number;
  constructor(status: number, msg: string) {
    super(msg);
    this.status = status;
  }
}

function getAdmin() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "";
    if (!raw) throw new HttpError(500, "서버 설정이 없습니다.");
    const sa = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(sa) });
  }
  return admin;
}

function teacherSecret() {
  const code = process.env.TEACHER_ACCESS_CODE || "";
  if (!code) throw new HttpError(500, "교사 인증 코드가 설정되지 않았습니다.");
  return code;
}

function signTeacherToken() {
  const payload = Buffer.from(JSON.stringify({ role: "teacher", exp: Date.now() + SESSION_MS })).toString("base64url");
  const sig = crypto.createHmac("sha256", teacherSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyTeacherToken(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const m = /^Bearer (.+)$/.exec(header);
  const token = m?.[1] || "";
  const [payload, sig] = token.split(".");
  if (!payload || !sig) throw new HttpError(401, "교사 로그인이 필요합니다.");
  const expected = crypto.createHmac("sha256", teacherSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new HttpError(401, "교사 로그인이 필요합니다.");
  let data: { role?: string; exp?: number };
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new HttpError(401, "교사 로그인이 필요합니다.");
  }
  if (data.role !== "teacher" || !data.exp || data.exp < Date.now()) {
    throw new HttpError(401, "로그인이 만료되었습니다. 다시 로그인해주세요.");
  }
}

function clip(s: unknown, max: number) {
  return String(s ?? "").trim().slice(0, max);
}

function serialize(id: string, data: FirebaseFirestore.DocumentData) {
  const out: Record<string, unknown> = { id, ...data };
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (v && typeof v === "object" && typeof (v as { toDate?: () => Date }).toDate === "function") {
      out[key] = (v as { toDate: () => Date }).toDate().toISOString();
    }
  }
  return out;
}

const STUDENT_CREATE_BLOCK = new Set([
  "teacher_approved",
  "ai_response",
  "selected",
]);

async function checkTeacherLock(db: FirebaseFirestore.Firestore) {
  const lockRef = db.collection("_locks").doc("teacher-login");
  const lock = await lockRef.get();
  const now = Date.now();
  const lockedUntil = lock.exists ? Number(lock.get("lockedUntil") || 0) : 0;
  if (lockedUntil > now) {
    throw new HttpError(429, `비밀번호를 여러 번 틀렸어요. ${Math.ceil((lockedUntil - now) / 60000)}분 뒤에 다시 해 보세요.`);
  }
  return { lockRef, lock, now, lockedUntil };
}

const actions: Record<string, (db: FirebaseFirestore.Firestore, body: any, req: NextRequest) => Promise<unknown>> = {
  async listPublic(db) {
    const snap = await db.collection("conversations").where("type", "==", "knowledge").where("selected", "==", true).limit(20).get();
    return { conversations: snap.docs.map((d) => serialize(d.id, d.data())) };
  },

  async getMine(db, body) {
    const studentName = clip(body.student_name ?? body.studentName, 50);
    if (!studentName) throw new HttpError(400, "학생 번호를 입력해주세요.");
    const snap = await db.collection("conversations").where("student_name", "==", studentName).limit(200).get();
    const conversations = snap.docs
      .map((d) => serialize(d.id, d.data()))
      .filter((c) => c.type !== "knowledge");
    return { conversations };
  },

  async createStudent(db, body) {
    const type = body.type === "essay" ? "essay" : "conversation";
    const student_name = clip(body.student_name, 50);
    if (!student_name) throw new HttpError(400, "학생 번호를 입력해주세요.");
    const doc: Record<string, unknown> = {
      type,
      student_name,
      grade: clip(body.grade, 40),
      subject: clip(body.subject, 40),
      learning_objective: clip(body.learning_objective, 500),
      question: clip(body.question, 4000),
      ai_response: "",
      safety_status: clip(body.safety_status, 40) || "안전",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      teacher_approved: false,
      knowledge_title: clip(body.knowledge_title, 200),
      knowledge_reference_id: clip(body.knowledge_reference_id, 80),
      student_essay: clip(body.student_essay, 20000),
      mindmap_data: body.mindmap_data ?? null,
      essay_submitted: type === "essay" ? !!body.essay_submitted : false,
      essay_timestamp: body.essay_timestamp || null,
      violation_logs: Array.isArray(body.violation_logs) ? body.violation_logs.slice(0, 50) : [],
    };
    if (type === "essay" && !doc.student_essay) throw new HttpError(400, "글을 입력해주세요.");
    if (type === "conversation" && String(doc.question).length < 3) throw new HttpError(400, "질문을 입력해주세요.");
    const ref = await db.collection("conversations").add(doc);
    const saved = await ref.get();
    return { ok: true, conversation: serialize(ref.id, saved.data() || doc) };
  },

  async updateStudent(db, body) {
    const id = clip(body.id, 80);
    const student_name = clip(body.student_name, 50);
    if (!id || !student_name) throw new HttpError(400, "학생 정보와 문서가 필요합니다.");
    const ref = db.collection("conversations").doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "문서를 찾을 수 없습니다.");
    if (String(snap.get("student_name") || "") !== student_name) {
      throw new HttpError(403, "내 글만 수정할 수 있습니다.");
    }
    const allowed: Record<string, unknown> = {};
    if ("student_essay" in body) allowed.student_essay = clip(body.student_essay, 20000);
    if ("mindmap_data" in body) allowed.mindmap_data = body.mindmap_data ?? null;
    if ("essay_submitted" in body) allowed.essay_submitted = !!body.essay_submitted;
    if ("essay_timestamp" in body) allowed.essay_timestamp = body.essay_timestamp || null;
    if ("violation_logs" in body && Array.isArray(body.violation_logs)) {
      allowed.violation_logs = body.violation_logs.slice(0, 50);
    }
    if ("question" in body && snap.get("type") !== "essay") allowed.question = clip(body.question, 4000);
    if (Object.keys(allowed).length === 0) throw new HttpError(400, "수정할 내용이 없습니다.");
    await ref.update(allowed);
    const saved = await ref.get();
    return { ok: true, conversation: serialize(id, saved.data() || {}) };
  },

  async teacherLogin(db, body) {
    const code = String(body.code || body.password || "");
    const { lockRef, lock, now, lockedUntil } = await checkTeacherLock(db);
    const expected = teacherSecret();
    const a = Buffer.from(code);
    const b = Buffer.from(expected);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) {
      const fails = (lock.exists && lockedUntil <= now && lockedUntil !== 0 ? 0 : (lock.exists ? Number(lock.get("fails") || 0) : 0)) + 1;
      await lockRef.set(fails >= MAX_FAILS ? { fails: 0, lockedUntil: now + LOCK_MS } : { fails, lockedUntil: 0 });
      if (fails >= MAX_FAILS) throw new HttpError(429, "비밀번호를 5번 틀려서 5분 동안 잠겼어요.");
      throw new HttpError(401, `비밀번호가 올바르지 않습니다. (${fails}/${MAX_FAILS})`);
    }
    if (lock.exists) await lockRef.delete();
    return { ok: true, token: signTeacherToken() };
  },

  async teacherList(db, _body, req) {
    verifyTeacherToken(req);
    const snap = await db.collection("conversations").orderBy("timestamp", "desc").limit(999).get();
    return { conversations: snap.docs.map((d) => serialize(d.id, d.data())) };
  },

  async teacherUpdate(db, body, req) {
    verifyTeacherToken(req);
    const id = clip(body.id, 80);
    if (!id) throw new HttpError(400, "문서 ID가 필요합니다.");
    const updates = { ...(body.updates || body) };
    delete updates.id;
    delete updates.action;
    delete updates.updates;
    if (!Object.keys(updates).length) throw new HttpError(400, "수정할 내용이 없습니다.");
    await db.collection("conversations").doc(id).update(updates);
    const saved = await db.collection("conversations").doc(id).get();
    return { ok: true, conversation: serialize(id, saved.data() || {}) };
  },

  async teacherCreate(db, body, req) {
    verifyTeacherToken(req);
    const data = { ...(body.data || body) };
    delete data.action;
    delete data.data;
    data.type = data.type || "knowledge";
    data.timestamp = admin.firestore.FieldValue.serverTimestamp();
    if (data.type !== "knowledge" && STUDENT_CREATE_BLOCK.has("x")) {
      // placeholder to keep set referenced
    }
    const ref = await db.collection("conversations").add(data);
    const saved = await ref.get();
    return { ok: true, conversation: serialize(ref.id, saved.data() || data) };
  },

  async teacherDelete(db, body, req) {
    verifyTeacherToken(req);
    const id = clip(body.id, 80);
    if (!id) throw new HttpError(400, "문서 ID가 필요합니다.");
    await db.collection("conversations").doc(id).delete();
    return { ok: true };
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fn = actions[body?.action];
    if (!fn) throw new HttpError(400, "알 수 없는 요청입니다.");
    const db = getAdmin().firestore();
    const result = await fn(db, body, request);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    if (!(e instanceof HttpError)) console.error("conversations api error:", e);
    const status = e instanceof HttpError ? e.status : 500;
    return NextResponse.json(
      { error: e instanceof HttpError ? e.message : "서버 오류가 발생했습니다." },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
