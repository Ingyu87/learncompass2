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
    studentNumber: "",
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
      // 세션에서 번호 가져오기 (선택사항)
      const userNumber = sessionStorage.getItem("userNumber");
      if (userNumber) {
        setLearningConfig((prev) => ({ ...prev, studentNumber: userNumber }));
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

