"use client";

import { useState, useEffect } from "react";
import LearningSetup from "@/components/LearningSetup";
import ChatInterface from "@/components/ChatInterface";
import { useFirebase } from "@/hooks/useFirebase";

export default function StudentInterface() {
  const { conversations, addConversation } = useFirebase();
  const [learningConfig, setLearningConfig] = useState({
    studentNumber: "",
    grade: "",
    subject: "",
    learningObjective: "",
    knowledgeId: "",
  });

  // Get knowledge data for dropdown
  const knowledgeData = conversations.filter((item: any) => item.type === "knowledge");
  const uniqueObjectives = [
    ...new Set(
      knowledgeData
        .map((k: any) => k.learning_objective)
        .filter((obj: string) => obj)
    ),
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <LearningSetup
          config={learningConfig}
          onConfigChange={setLearningConfig}
          knowledgeData={knowledgeData}
          uniqueObjectives={uniqueObjectives}
        />
      </div>
      <div className="lg:col-span-2">
        <ChatInterface
          learningConfig={learningConfig}
          onConversationCreate={addConversation}
          knowledgeData={knowledgeData}
        />
      </div>
    </div>
  );
}

