"use client";

import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import StudentEssay from "@/components/StudentEssay";
import { useFirebase } from "@/hooks/useFirebase";

export default function StudentInterface() {
  const { conversations, addConversation } = useFirebase();
  const [learningConfig, setLearningConfig] = useState({
    studentNumber: "",
    grade: "",
    subject: "",
    learningObjective: "",
  });

  // 교사가 선택한 지식 찾기
  const knowledgeData = conversations.filter((item: any) => item.type === "knowledge");
  const selectedKnowledge = knowledgeData.find((k: any) => k.selected === true);

  // 선택된 지식이 있으면 자동으로 설정
  useEffect(() => {
    if (selectedKnowledge && !learningConfig.grade) {
      setLearningConfig({
        studentNumber: learningConfig.studentNumber,
        grade: selectedKnowledge.grade || "",
        subject: selectedKnowledge.subject || "",
        learningObjective: selectedKnowledge.achievement_standard_text || selectedKnowledge.learning_objective || "",
      });
    }
  }, [selectedKnowledge]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        {/* 학습 정보 표시 */}
        <div className="bg-white rounded-xl card-shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📚</span> 학습 정보
          </h2>
          
          {!selectedKnowledge ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                선생님이 학습 자료를 선택하면 여기에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  학생 번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="학생 번호를 입력하세요 (필수)"
                  min="1"
                  max="999"
                  required
                  value={learningConfig.studentNumber}
                  onChange={(e) =>
                    setLearningConfig({ ...learningConfig, studentNumber: e.target.value })
                  }
                />
                {!learningConfig.studentNumber && (
                  <p className="text-xs text-red-500 mt-1">학생 번호를 입력해야 질문할 수 있습니다.</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-xs font-medium text-blue-700">지식 제목</span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{selectedKnowledge.knowledge_title}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-700">학년</span>
                  <p className="text-sm text-gray-800 mt-1">{selectedKnowledge.grade}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-blue-700">과목</span>
                  <p className="text-sm text-gray-800 mt-1">{selectedKnowledge.subject}</p>
                </div>
                {selectedKnowledge.area && (
                  <div>
                    <span className="text-xs font-medium text-blue-700">영역</span>
                    <p className="text-sm text-gray-800 mt-1">{selectedKnowledge.area}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs font-medium text-blue-700">성취기준</span>
                  <p className="text-sm text-gray-800 mt-1">
                    {selectedKnowledge.achievement_standard_text || selectedKnowledge.learning_objective}
                  </p>
                </div>
              </div>

              {/* 평가 루브릭 표시 */}
              {selectedKnowledge.rubric && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-bold text-green-800 mb-3">📊 평가 루브릭</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-green-700">상 수준:</span>
                      <p className="text-gray-700 mt-1">{selectedKnowledge.rubric.high}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-green-700">중 수준:</span>
                      <p className="text-gray-700 mt-1">{selectedKnowledge.rubric.medium}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-green-700">하 수준:</span>
                      <p className="text-gray-700 mt-1">{selectedKnowledge.rubric.low}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                  <span className="mr-2">🛡️</span> 안전 수칙
                </h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 학생 번호만 입력하고 이름은 입력하지 마세요</li>
                  <li>• 학습 목표에 맞는 질문만 해주세요</li>
                  <li>• 부적절한 내용은 자동으로 차단됩니다</li>
                  <li>• 선생님이 모든 대화를 확인할 수 있어요</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="lg:col-span-2 space-y-6">
            <ChatInterface
              learningConfig={learningConfig}
              onConversationCreate={addConversation}
              conversations={conversations}
              knowledgeContent={selectedKnowledge?.knowledge_content || ""} // RAG: 선택된 지식 내용 전달
              knowledgeTitle={selectedKnowledge?.knowledge_title || ""} // 선택된 지식 제목 전달
            />
        <StudentEssay
          studentNumber={learningConfig.studentNumber}
          grade={learningConfig.grade}
          subject={learningConfig.subject}
          learningObjective={learningConfig.learningObjective}
          conversations={conversations}
        />
      </div>
    </div>
  );
}

