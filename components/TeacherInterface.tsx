"use client";

import { useState } from "react";
import TeacherLogin from "@/components/TeacherLogin";
import TeacherDashboard from "@/components/TeacherDashboard";
import KnowledgeManagement from "@/components/KnowledgeManagement";
import { useFirebase, clearTeacherToken, getTeacherToken } from "@/hooks/useFirebase";

export default function TeacherInterface() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getTeacherToken());
  const { conversations, updateConversation, deleteConversation } = useFirebase({ teacher: isLoggedIn });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    clearTeacherToken();
    setIsLoggedIn(false);
  };

  const handleApprovalToggle = async (id: string, updates: any) => {
    await updateConversation(id, updates);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
  };

  if (!isLoggedIn) {
    return <TeacherLogin onLogin={handleLogin} />;
  }

  return (
    <div className="space-y-8">
      <TeacherDashboard
        conversations={conversations}
        onApprovalToggle={handleApprovalToggle}
        onDeleteConversation={handleDeleteConversation}
        onLogout={handleLogout}
      />
      <KnowledgeManagement conversations={conversations} />
    </div>
  );
}



