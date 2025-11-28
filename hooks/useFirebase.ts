"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Conversation {
  id?: string;
  __backendId?: string; // Firebase 내부 ID (타입 호환성)
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
  // 지식 분석 관련 필드
  selected?: boolean; // 교사가 선택한 지식인지
  area?: string; // 영역
  achievement_standard?: string; // 성취기준 코드
  achievement_standard_text?: string; // 성취기준 전체 텍스트
  rubric?: { // 평가 루브릭
    high: string;
    medium: string;
    low: string;
  };
  // 글 작성 및 마인드맵 관련 필드
  student_essay?: string; // 학생이 작성한 글
  mindmap_data?: any; // 마인드맵 데이터 (JSON)
  essay_submitted?: boolean; // 글 제출 여부
  essay_timestamp?: Date | Timestamp; // 글 작성 시간
  knowledge_reference_id?: string; // 연결된 지식 ID
  // 복사/비속어 감지 로그
  violation_logs?: Array<{
    type: "copy_paste" | "profanity";
    timestamp: Date | Timestamp;
    detected_text?: string;
  }>;
}

export function useFirebase() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !db) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "conversations"),
      orderBy("timestamp", "desc"),
      limit(999)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Conversation[] = [];
      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        } as Conversation);
      });
      setConversations(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addConversation = async (conversation: Omit<Conversation, "id">) => {
    if (!db) {
      throw new Error("Firebase가 초기화되지 않았습니다.");
    }
    
    try {
      const data: any = {
        ...conversation,
      };
      
      // knowledge 타입은 upload_date를, conversation 타입은 timestamp를 사용
      if ((conversation as any).type === "knowledge") {
        data.upload_date = (conversation as any).upload_date || new Date().toISOString();
        data.timestamp = Timestamp.now(); // 정렬을 위해 timestamp도 추가
      } else {
        data.timestamp = Timestamp.now();
      }
      
      await addDoc(collection(db, "conversations"), data);
    } catch (error) {
      console.error("대화 저장 실패:", error);
      throw error;
    }
  };

  const updateConversation = async (
    id: string,
    updates: Partial<Conversation>
  ) => {
    if (!db) {
      throw new Error("Firebase가 초기화되지 않았습니다.");
    }
    
    try {
      const docRef = doc(db, "conversations", id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("대화 업데이트 실패:", error);
      throw error;
    }
  };

  const deleteConversation = async (id: string) => {
    if (!db) {
      throw new Error("Firebase가 초기화되지 않았습니다.");
    }
    
    try {
      const docRef = doc(db, "conversations", id);
      await deleteDoc(docRef);
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
  };
}

