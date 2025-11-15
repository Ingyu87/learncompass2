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
  });

  // Get knowledge data for dropdown
  const knowledgeData = conversations.filter((item: any) => item.type === "knowledge");
  
  // Get unique grades and subjects from uploaded knowledge
  const availableGrades = [
    ...new Set(
      knowledgeData
        .map((k: any) => k.grade)
        .filter((grade: string) => grade)
    ),
  ].sort();

  const availableSubjects = [
    ...new Set(
      knowledgeData
        .map((k: any) => k.subject)
        .filter((subject: string) => subject)
    ),
  ].sort();

  // Filter objectives based on selected grade and subject
  const filteredKnowledge = learningConfig.grade && learningConfig.subject
    ? knowledgeData.filter(
        (k: any) => k.grade === learningConfig.grade && k.subject === learningConfig.subject
      )
    : knowledgeData;

  const uniqueObjectives = [
    ...new Set(
      filteredKnowledge
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
          uniqueObjectives={uniqueObjectives}
          availableGrades={availableGrades}
          availableSubjects={availableSubjects}
        />
      </div>
      <div className="lg:col-span-2">
        <ChatInterface
          learningConfig={learningConfig}
          onConversationCreate={addConversation}
        />
      </div>
    </div>
  );
}

