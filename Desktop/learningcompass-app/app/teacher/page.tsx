"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import TeacherDashboard from "@/components/TeacherDashboard";
import { useFirebase } from "@/hooks/useFirebase";

export default function TeacherPage() {
  const router = useRouter();
  const { conversations, updateConversation } = useFirebase();

  useEffect(() => {
    // 로그인 확인
    if (typeof window !== "undefined") {
      const userRole = sessionStorage.getItem("userRole");
      if (userRole !== "teacher") {
        router.push("/login");
        return;
      }
    }
  }, [router]);

  const handleApprovalToggle = async (id: string, updates: any) => {
    await updateConversation(id, updates);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userName");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-full">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeacherDashboard
          conversations={conversations}
          onApprovalToggle={handleApprovalToggle}
        />
      </main>
    </div>
  );
}

