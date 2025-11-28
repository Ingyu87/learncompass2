"use client";

import { useState, useMemo, useEffect } from "react";
import { Conversation, useFirebase } from "@/hooks/useFirebase";
import WordCloud, { extractWords } from "@/components/WordCloud";

interface TeacherDashboardProps {
  conversations: Conversation[];
  onApprovalToggle: (id: string, updates: Partial<Conversation>) => Promise<void>;
  onDeleteConversation?: (id: string) => Promise<void>;
  onLogout?: () => void;
}

export default function TeacherDashboard({
  conversations,
  onApprovalToggle,
  onDeleteConversation,
  onLogout,
}: TeacherDashboardProps) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"questions" | "essays">("questions");
  const [mainTab, setMainTab] = useState<"students" | "knowledge">("students");
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(null);
  const getTimestampMillis = (value: any): number => {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    if (typeof value === "object") {
      const toDate = (value as { toDate?: () => Date }).toDate;
      if (typeof toDate === "function") {
        const date = toDate.call(value);
        return date instanceof Date ? date.getTime() : 0;
      }
    }
    return 0;
  };
  const handleApprovalToggle = async (id: string, currentStatus: boolean) => {
    const conversation = conversations.find((c: any) => c.id === id || c.__backendId === id);
    
    if (!currentStatus && conversation) {
      // RAG: 선택된 지식 내용 찾기
      const knowledgeData = conversations.filter((item: any) => item.type === "knowledge");
      const selectedKnowledge = knowledgeData.find((k: any) => k.selected === true);
      const knowledgeContent = selectedKnowledge?.knowledge_content || "";
      
      // 승인 시 AI 응답 생성
      try {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: conversation.question,
            subject: conversation.subject,
            grade: conversation.grade,
            learningObjective: conversation.learning_objective,
            knowledgeContent: knowledgeContent, // RAG: 지식 내용 전달
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "API 요청 실패");
        }

        const data = await response.json();
        const aiResponse = data.response || "죄송해요, 답변을 생성하는데 문제가 생겼어요.";

        // 승인과 함께 AI 응답 업데이트
        await onApprovalToggle(id, { 
          teacher_approved: true,
          ai_response: aiResponse 
        });
      } catch (error: any) {
        console.error("AI 응답 생성 오류:", error);
        alert(`AI 응답 생성에 실패했습니다: ${error.message}`);
      }
    } else {
      // 승인 해제
      await onApprovalToggle(id, { teacher_approved: false });
    }
  };

  // 학생별 자료 내보내기
  const exportStudentData = (studentNumber: string) => {
    const studentConversations = conversations.filter(
      (item: any) =>
        (item.type === "conversation" || !item.type) &&
        item.student_name === studentNumber
    );
    
    const studentEssays = conversations.filter(
      (item: any) =>
        item.type === "essay" &&
        item.student_name === studentNumber &&
        item.essay_submitted === true
    );

    // 질문 데이터
    const questionsData = [
      ["시간", "과목", "참고자료", "질문", "AI응답", "안전성", "승인여부"],
      ...studentConversations.map((item) => {
        const timestamp =
          item.timestamp instanceof Date
            ? item.timestamp.toLocaleString("ko-KR")
            : new Date((item.timestamp as any).toDate?.() || item.timestamp).toLocaleString("ko-KR");
        return [
          timestamp,
          item.subject,
          item.knowledge_title || "없음",
          item.question,
          item.ai_response || "",
          item.safety_status,
          item.teacher_approved ? "승인됨" : "미승인",
        ];
      }),
    ];

    // 글 작성 데이터
    const essaysData = [
      ["시간", "작성한 글", "위반 횟수"],
      ...studentEssays.map((item) => {
        const timestamp =
          item.essay_timestamp instanceof Date
            ? item.essay_timestamp.toLocaleString("ko-KR")
            : new Date((item.essay_timestamp as any)?.toDate?.() || item.essay_timestamp || item.timestamp).toLocaleString("ko-KR");
        return [
          timestamp,
          item.student_essay || "",
          (item.violation_logs?.length || 0).toString(),
        ];
      }),
    ];

    // CSV 생성
    const csvContent = [
      `학생 ${studentNumber} 자료`,
      "",
      "=== 질문 기록 ===",
      ...questionsData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      "",
      "=== 글 작성 기록 ===",
      ...essaysData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `배움나침반_학생${studentNumber}_자료_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // 대화 삭제 핸들러
  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 대화를 삭제하시겠습니까?")) {
      return;
    }

    if (onDeleteConversation) {
      try {
        await onDeleteConversation(id);
        alert("대화가 삭제되었습니다.");
      } catch (error: any) {
        console.error("삭제 오류:", error);
        alert(`삭제에 실패했습니다: ${error.message}`);
      }
    }
  };

  // 학생 목록 추출 및 미승인 질문 수 계산
  const students = useMemo(() => {
    const studentSet = new Set<string>();
    conversations.forEach((item: any) => {
      if (item.student_name) {
        studentSet.add(item.student_name);
      }
    });
    return Array.from(studentSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [conversations]);

  // 각 학생별 미승인 질문 수 계산
  const getPendingQuestionCount = (studentNumber: string) => {
    return conversations.filter(
      (item: any) =>
        (item.type === "conversation" || !item.type) &&
        item.student_name === studentNumber &&
        item.teacher_approved === false
    ).length;
  };

  // 선택된 학생이 없으면 첫 번째 학생 선택
  useEffect(() => {
    if (!selectedStudent && students.length > 0) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  // 선택된 학생의 데이터 필터링
  const studentData = useMemo(() => {
    if (!selectedStudent) return { questions: [], essays: [] };
    
    const questions = conversations.filter(
      (item: any) =>
        (item.type === "conversation" || !item.type) &&
        item.student_name === selectedStudent
    );
    
    const essays = conversations.filter(
      (item: any) =>
        item.type === "essay" &&
        item.student_name === selectedStudent &&
        item.essay_submitted === true
    );
    
    return { questions, essays };
  }, [conversations, selectedStudent]);

  // 지식 목록 추출
  const knowledgeList = useMemo(() => {
    return conversations.filter((item: any) => item.type === "knowledge");
  }, [conversations]);

  // 선택된 지식이 없으면 첫 번째 지식 선택
  useEffect(() => {
    if (mainTab === "knowledge" && !selectedKnowledge && knowledgeList.length > 0) {
      setSelectedKnowledge(knowledgeList[0].id || knowledgeList[0].__backendId || null);
    }
  }, [mainTab, selectedKnowledge, knowledgeList]);

  // 선택된 지식에 대한 질문 워드 클라우드 데이터 생성
  const questionWordCloud = useMemo(() => {
    if (!selectedKnowledge) return [];

    const selectedKnowledgeItem = knowledgeList.find(
      (k: any) => (k.id || k.__backendId) === selectedKnowledge
    );
    if (!selectedKnowledgeItem) return [];
    const knowledgeObjective =
      selectedKnowledgeItem.achievement_standard_text ||
      selectedKnowledgeItem.learning_objective ||
      "";

    // 해당 지식과 정확히 일치하는 질문들만 필터링
    // 1. 지식 제목이 정확히 일치하는 경우
    // 2. 같은 과목, 같은 학년, 그리고 질문 시간이 지식 업로드 시간 이후인 경우
    const knowledgeTitle = selectedKnowledgeItem.knowledge_title;
    const knowledgeSubject = selectedKnowledgeItem.subject;
    const knowledgeGrade = selectedKnowledgeItem.grade;
    const knowledgeUploadTime = getTimestampMillis(selectedKnowledgeItem.upload_date);

    const relatedQuestions = conversations.filter((item: any) => {
      if (!(item.type === "conversation" || !item.type) || !item.question) {
        return false;
      }

      // 지식 제목이 정확히 일치하는 경우
      if (item.knowledge_title === knowledgeTitle) {
        return true;
      }

      // 같은 과목, 같은 학년인 경우
      if (item.subject === knowledgeSubject && item.grade === knowledgeGrade) {
        // 질문 시간이 지식 업로드 시간 이후인 경우만
        const questionTime = getTimestampMillis(item.timestamp);
        
        // 지식이 업로드된 이후의 질문만 포함
        return questionTime >= knowledgeUploadTime;
      }

      return false;
    });

    const questionTexts = relatedQuestions.map((item: any) => item.question).join(" ");
    const wordMap = extractWords(questionTexts, 2);
    return Array.from(wordMap.entries())
      .map(([text, value]) => ({ text, value }))
      .filter((word) => word.value > 0);
  }, [conversations, selectedKnowledge, knowledgeList]);

  // 선택된 지식에 연결된 학생 글 워드 클라우드 데이터 생성
  const essayWordCloud = useMemo(() => {
    if (!selectedKnowledge) return [];

    const selectedKnowledgeItem = knowledgeList.find(
      (k: any) => (k.id || k.__backendId) === selectedKnowledge
    );
    if (!selectedKnowledgeItem) return [];
    const knowledgeObjective =
      selectedKnowledgeItem.achievement_standard_text ||
      selectedKnowledgeItem.learning_objective ||
      "";

    const relevantEssays = conversations.filter((item: any) => {
      if (item.type !== "essay" || !item.essay_submitted || !item.student_essay) {
        return false;
      }

      if (item.knowledge_reference_id) {
        return item.knowledge_reference_id === selectedKnowledge;
      }

      if (item.knowledge_title && selectedKnowledgeItem.knowledge_title) {
        return item.knowledge_title === selectedKnowledgeItem.knowledge_title;
      }

      return (
        item.subject === selectedKnowledgeItem.subject &&
        item.grade === selectedKnowledgeItem.grade &&
        !!knowledgeObjective &&
        item.learning_objective === knowledgeObjective
      );
    });

    if (relevantEssays.length === 0) {
      return [];
    }

    const essayTexts = relevantEssays.map((item: any) => item.student_essay || "").join(" ");
    const wordMap = extractWords(essayTexts, 2);
    return Array.from(wordMap.entries())
      .map(([text, value]) => ({ text, value }))
      .filter((word) => word.value > 0);
  }, [conversations, selectedKnowledge, knowledgeList]);

  return (
    <>
      <div className="bg-white rounded-xl card-shadow p-4 sm:p-6 mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-2xl">👩‍🏫</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">교사 관리 대시보드</h2>
              <p className="text-gray-600 text-xs sm:text-sm">학습 자료와 대화 기록을 관리하세요</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs sm:text-sm w-full sm:w-auto"
            >
              로그아웃
            </button>
          )}
        </div>
      </div>

      {/* 상단 탭 (학생별 / 지식별) */}
      <div className="bg-white rounded-xl card-shadow p-3 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => {
              setMainTab("students");
              setSelectedKnowledge(null);
            }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
              mainTab === "students"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            학생별 관리
          </button>
          {/* 지식별 탭 - 각 지식마다 탭 생성 */}
          {knowledgeList.map((knowledge: any) => {
            const knowledgeId = knowledge.id || knowledge.__backendId;
            const isSelected = mainTab === "knowledge" && selectedKnowledge === knowledgeId;
            return (
              <button
                key={knowledgeId}
                onClick={() => {
                  setMainTab("knowledge");
                  setSelectedKnowledge(knowledgeId);
                  setSelectedStudent(null);
                }}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {knowledge.knowledge_title || "제목 없음"}
              </button>
            );
          })}
        </div>

        {mainTab === "students" && (
          <>
            {/* 학생별 탭 */}
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">👥</span> 학생별 관리
        </h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {students.map((student) => {
            const pendingCount = getPendingQuestionCount(student);
            return (
              <button
                key={student}
                onClick={() => setSelectedStudent(student)}
                className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                  selectedStudent === student
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                학생 {student}
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {selectedStudent && (
          <div className="border-t pt-3 sm:pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex space-x-1.5 sm:space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                    activeTab === "questions"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  질문 ({studentData.questions.length})
                </button>
                <button
                  onClick={() => setActiveTab("essays")}
                  className={`flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                    activeTab === "essays"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  글 작성 ({studentData.essays.length})
                </button>
              </div>
              <button
                onClick={() => exportStudentData(selectedStudent)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm w-full sm:w-auto"
              >
                자료 내보내기
              </button>
            </div>

            {activeTab === "questions" && (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-xs sm:text-sm min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">시간</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">과목</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">질문</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">AI 응답</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">위반</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">승인</th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentData.questions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-2 sm:px-4 py-6 sm:py-8 text-center text-gray-500">
                          질문이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      studentData.questions.map((item: any) => {
                        const timestamp =
                          item.timestamp instanceof Date
                            ? item.timestamp.toLocaleString("ko-KR")
                            : new Date((item.timestamp as any).toDate?.() || item.timestamp).toLocaleString("ko-KR");
                        const hasViolations = (item.violation_logs && item.violation_logs.length > 0) || 
                                            item.safety_status !== "안전";
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 whitespace-nowrap text-[10px] sm:text-sm">{timestamp}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{item.subject}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 max-w-[100px] sm:max-w-xs truncate" title={item.question}>
                              {item.question}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 max-w-[100px] sm:max-w-xs truncate" title={item.ai_response}>
                              {item.ai_response || "-"}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {hasViolations && (
                                <div className="flex items-center space-x-1">
                                  {item.violation_logs?.some((log: any) => log.type === "copy_paste") && (
                                    <span title="복사/붙여넣기 시도" className="text-red-500">📋</span>
                                  )}
                                  {item.violation_logs?.some((log: any) => log.type === "profanity") && (
                                    <span title="비속어 사용" className="text-red-500">🚫</span>
                                  )}
                                  {item.safety_status !== "안전" && (
                                    <span title={item.safety_status} className="text-orange-500">⚠️</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <button
                                onClick={() =>
                                  item.id && handleApprovalToggle(item.id, item.teacher_approved)
                                }
                                className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded ${
                                  item.teacher_approved
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                                } hover:opacity-80`}
                              >
                                {item.teacher_approved ? "승인" : "승인"}
                              </button>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              {item.id && (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  title="대화 삭제"
                                >
                                  삭제
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "essays" && (
              <div className="space-y-3 sm:space-y-4">
                {studentData.essays.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                    제출된 글이 없습니다.
                  </div>
                ) : (
                  studentData.essays.map((essay: any) => {
                    const timestamp =
                      essay.essay_timestamp instanceof Date
                        ? essay.essay_timestamp.toLocaleString("ko-KR")
                        : new Date((essay.essay_timestamp as any)?.toDate?.() || essay.essay_timestamp || essay.timestamp).toLocaleString("ko-KR");
                    const hasViolations = essay.violation_logs && essay.violation_logs.length > 0;
                    
                    return (
                      <div key={essay.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs sm:text-sm text-gray-600">{timestamp}</span>
                            {hasViolations && (
                              <div className="flex items-center space-x-1">
                                {essay.violation_logs.some((log: any) => log.type === "copy_paste") && (
                                  <span title="복사/붙여넣기 시도" className="text-red-500 text-base sm:text-lg">📋</span>
                                )}
                                {essay.violation_logs.some((log: any) => log.type === "profanity") && (
                                  <span title="비속어 사용" className="text-red-500 text-base sm:text-lg">🚫</span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-500">
                            {essay.violation_logs?.length || 0}건의 위반 감지
                          </span>
                        </div>
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">작성한 글:</h4>
                          <div className="bg-gray-50 p-2 sm:p-3 rounded border border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                              {essay.student_essay}
                            </p>
                          </div>
                        </div>
                        {essay.mindmap_data && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">마인드맵:</h4>
                            <div className="border border-gray-200 rounded-lg p-2 sm:p-4 bg-gray-50 overflow-x-auto">
                              <MindmapVisualization data={essay.mindmap_data} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
          </>
        )}

        {mainTab === "knowledge" && selectedKnowledge && (
          <>
            {/* 선택된 지식에 대한 워드 클라우드 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <WordCloud
                words={questionWordCloud}
                title="학생 질문 워드 클라우드"
                maxWords={50}
              />
              <WordCloud
                words={essayWordCloud}
                title="학생 글 워드 클라우드"
                maxWords={50}
              />
            </div>
          </>
        )}

        {mainTab === "knowledge" && !selectedKnowledge && knowledgeList.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            상단에서 지식을 선택하면 워드 클라우드를 확인할 수 있습니다.
          </div>
        )}

        {mainTab === "knowledge" && knowledgeList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            등록된 지식이 없습니다.
          </div>
        )}
      </div>
    </>
  );
}

// 마인드맵 시각화 컴포넌트
function MindmapVisualization({ data }: { data: any }) {
  if (!data || !data.root) {
    return <p className="text-gray-500">마인드맵 데이터가 없습니다.</p>;
  }

  return (
    <div className="mindmap-container">
      <div className="mindmap-root">
        <div className="mindmap-node root-node">
          <div className="font-bold text-lg">{data.root.name || "주제"}</div>
        </div>
        {data.root.children && data.root.children.length > 0 && (
          <div className="mindmap-branches">
            {data.root.children.map((child: any, idx: number) => (
              <div key={idx} className="mindmap-branch">
                <div className="mindmap-node branch-node">
                  <div className="font-semibold">{child.name}</div>
                  {child.children && child.children.length > 0 && (
                    <div className="mindmap-sub-branches">
                      {child.children.map((subChild: any, subIdx: number) => (
                        <div key={subIdx} className="mindmap-sub-node">
                          {subChild.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .mindmap-container {
          width: 100%;
          overflow-x: auto;
          padding: 20px;
        }
        .mindmap-root {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .mindmap-node {
          padding: 12px 20px;
          border-radius: 8px;
          margin: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .root-node {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 18px;
          margin-bottom: 20px;
        }
        .mindmap-branches {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
        }
        .mindmap-branch {
          flex: 1;
          min-width: 200px;
          max-width: 300px;
        }
        .branch-node {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }
        .mindmap-sub-branches {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mindmap-sub-node {
          padding: 8px 12px;
          background: #e0e7ff;
          border-radius: 6px;
          font-size: 14px;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
}

