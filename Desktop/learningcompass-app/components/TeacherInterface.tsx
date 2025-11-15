"use client";

import { useState } from "react";
import TeacherLogin from "@/components/TeacherLogin";
import TeacherDashboard from "@/components/TeacherDashboard";
import KnowledgeManagement from "@/components/KnowledgeManagement";
import { useFirebase } from "@/hooks/useFirebase";

export default function TeacherInterface() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { conversations, updateConversation } = useFirebase();

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleApprovalToggle = async (id: string, updates: any) => {
    await updateConversation(id, updates);
  };

  if (!isLoggedIn) {
    return <TeacherLogin onLogin={handleLogin} />;
  }

  return (
    <div className="space-y-8">
      <TeacherDashboard
        conversations={conversations}
        onApprovalToggle={handleApprovalToggle}
        onLogout={handleLogout}
      />
      <KnowledgeManagement conversations={conversations} />
    </div>
  );
}


