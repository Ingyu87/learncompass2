"use client";

import { useState, useEffect, useCallback } from "react";
import type { Timestamp } from "firebase/firestore";

export interface Conversation {
  id?: string;
  __backendId?: string;
  type?: string;
  student_name: string;
  grade: string;
  subject: string;
  learning_objective: string;
  question: string;
  ai_response: string;
  safety_status: string;
  timestamp: Date | Timestamp;
  teacher_approved: boolean;
  knowledge_title?: string;
  knowledge_content?: string;
  file_name?: string;
  content_type?: string;
  upload_date?: string | Date | Timestamp;
  selected?: boolean;
  area?: string;
  achievement_standard?: string;
  achievement_standard_text?: string;
  rubric?: {
    high: string;
    medium: string;
    low: string;
  };
  student_essay?: string;
  mindmap_data?: any;
  essay_submitted?: boolean;
  essay_timestamp?: Date | Timestamp;
  knowledge_reference_id?: string;
  violation_logs?: Array<{
    type: "copy_paste" | "profanity";
    timestamp: Date | Timestamp;
    detected_text?: string;
  }>;
}

const TOKEN_KEY = "teacherAccessToken";

export function getTeacherToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setTeacherToken(token: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearTeacherToken() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
}

async function api(body: Record<string, unknown>, withTeacher = false) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (withTeacher) {
    const token = getTeacherToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "요청에 실패했습니다.");
  return data;
}

export async function teacherLogin(code: string) {
  const data = await api({ action: "teacherLogin", code });
  if (data.token) setTeacherToken(data.token);
  return data;
}

type Options = {
  studentName?: string;
  teacher?: boolean;
};

export function useFirebase(opts: Options = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const studentName = opts.studentName || "";
  const teacher = !!opts.teacher;

  const load = useCallback(async () => {
    try {
      if (getTeacherToken()) {
        const data = await api({ action: "teacherList" }, true);
        setConversations((data.conversations || []) as Conversation[]);
        return;
      }
      const pub = await api({ action: "listPublic" });
      let mine: Conversation[] = [];
      if (studentName) {
        const data = await api({ action: "getMine", student_name: studentName });
        mine = (data.conversations || []) as Conversation[];
      }
      setConversations([...(pub.conversations || []), ...mine] as Conversation[]);
    } catch (error) {
      console.error("대화 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [studentName, teacher]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    load();
    const timer = setInterval(load, 8000);
    return () => clearInterval(timer);
  }, [load]);

  const addConversation = async (conversation: Omit<Conversation, "id">) => {
    try {
      if (getTeacherToken()) {
        await api({ action: "teacherCreate", data: conversation }, true);
      } else {
        await api({ action: "createStudent", ...conversation });
      }
      await load();
    } catch (error) {
      console.error("대화 저장 실패:", error);
      throw error;
    }
  };

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    try {
      if (getTeacherToken()) {
        await api({ action: "teacherUpdate", id, updates }, true);
      } else {
        await api({
          action: "updateStudent",
          id,
          student_name: updates.student_name || studentName,
          ...updates,
        });
      }
      await load();
    } catch (error) {
      console.error("대화 업데이트 실패:", error);
      throw error;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await api({ action: "teacherDelete", id }, true);
      await load();
    } catch (error) {
      console.error("대화 삭제 실패:", error);
      throw error;
    }
  };

  return {
    conversations,
    loading,
    addConversation,
    updateConversation,
    deleteConversation,
    reload: load,
  };
}
