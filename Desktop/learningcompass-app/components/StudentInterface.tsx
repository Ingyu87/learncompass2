"use client";

import { useState, useEffect } from "react";
import LearningSetup from "@/components/LearningSetup";
import ChatInterface from "@/components/ChatInterface";
import { useFirebase } from "@/hooks/useFirebase";
import {
  loadCurriculumData,
  getStandardsBySubjectGradeAndArea,
  type CurriculumStandard,
} from "@/lib/curriculum";

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

  // 성취기준 데이터
  const [curriculumStandards, setCurriculumStandards] = useState<CurriculumStandard[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");

  useEffect(() => {
    const loadStandards = async () => {
      if (learningConfig.grade && learningConfig.subject) {
        try {
          const standards = await getStandardsBySubjectGradeAndArea(
            learningConfig.subject,
            learningConfig.grade,
            selectedArea || undefined
          );
          setCurriculumStandards(standards);
          
          // 영역 목록 추출
          const areas = [...new Set(standards.map((s) => s.영역))].sort();
          setAvailableAreas(areas);
        } catch (error) {
          console.error("성취기준 로드 오류:", error);
        }
      } else {
        setCurriculumStandards([]);
        setAvailableAreas([]);
      }
    };

    loadStandards();
  }, [learningConfig.grade, learningConfig.subject, selectedArea]);

  // 영역 변경 시 학습 목표 초기화
  useEffect(() => {
    if (selectedArea) {
      setLearningConfig({ ...learningConfig, learningObjective: "" });
    }
  }, [selectedArea]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <LearningSetup
          config={learningConfig}
          onConfigChange={setLearningConfig}
          uniqueObjectives={uniqueObjectives}
          availableGrades={availableGrades}
          availableSubjects={availableSubjects}
          curriculumStandards={curriculumStandards}
          availableAreas={availableAreas}
          selectedArea={selectedArea}
          onAreaChange={setSelectedArea}
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

