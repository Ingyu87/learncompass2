"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import LearningSetup from "@/components/LearningSetup";
import ChatInterface from "@/components/ChatInterface";
import { useFirebase } from "@/hooks/useFirebase";

export default function StudentPage() {
  const router = useRouter();
  const { conversations, addConversation, updateConversation } = useFirebase();
  const [learningConfig, setLearningConfig] = useState({
    studentName: "",
    grade: "",
    subject: "",
    learningObjective: "",
  });

  useEffect(() => {
    // 로그인 확인
    if (typeof window !== "undefined") {
      const userRole = sessionStorage.getItem("userRole");
      if (userRole !== "student") {
        router.push("/login");
        return;
      }
      // 세션에서 이름 가져오기
      const userName = sessionStorage.getItem("userName");
      if (userName) {
        setLearningConfig((prev) => ({ ...prev, studentName: userName }));
      }
    }
  }, [router]);

  return (
    <div className="min-h-full">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LearningSetup
              config={learningConfig}
              onConfigChange={setLearningConfig}
            />
          </div>
          <div className="lg:col-span-2">
            <ChatInterface
              learningConfig={learningConfig}
              onConversationCreate={addConversation}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

