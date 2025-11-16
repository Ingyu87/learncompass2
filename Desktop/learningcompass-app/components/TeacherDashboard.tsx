"use client";

import { useState, useMemo, useEffect } from "react";
import { Conversation, useFirebase } from "@/hooks/useFirebase";

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

  const conversationData = conversations.filter(
    (item: any) => item.type === "conversation" || !item.type
  );

  return (
    <>
      <div className="bg-white rounded-xl card-shadow p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👩‍🏫</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">교사 관리 대시보드</h2>
              <p className="text-gray-600">학습 자료와 대화 기록을 관리하세요</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              로그아웃
            </button>
          )}
        </div>
      </div>

      {/* 학생별 탭 */}
      <div className="bg-white rounded-xl card-shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">👥</span> 학생별 관리
        </h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {students.map((student) => {
            const pendingCount = getPendingQuestionCount(student);
            return (
              <button
                key={student}
                onClick={() => setSelectedStudent(student)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedStudent === student
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                학생 {student}
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {selectedStudent && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("questions")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === "questions"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  질문 ({studentData.questions.length})
                </button>
                <button
                  onClick={() => setActiveTab("essays")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
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
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                학생별 자료 내보내기
              </button>
            </div>

            {activeTab === "questions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">시간</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">과목</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">질문</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">AI 응답</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">위반</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">승인</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {studentData.questions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
                            <td className="px-4 py-3 text-gray-600">{timestamp}</td>
                            <td className="px-4 py-3">{item.subject}</td>
                            <td className="px-4 py-3 max-w-xs truncate" title={item.question}>
                              {item.question}
                            </td>
                            <td className="px-4 py-3 max-w-xs truncate" title={item.ai_response}>
                              {item.ai_response || "-"}
                            </td>
                            <td className="px-4 py-3">
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
                            <td className="px-4 py-3">
                              <button
                                onClick={() =>
                                  item.id && handleApprovalToggle(item.id, item.teacher_approved)
                                }
                                className={`px-3 py-1 text-xs rounded ${
                                  item.teacher_approved
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-200 text-gray-700"
                                } hover:opacity-80`}
                              >
                                {item.teacher_approved ? "승인됨" : "승인"}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              {item.id && (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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
              <div className="space-y-4">
                {studentData.essays.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
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
                      <div key={essay.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{timestamp}</span>
                            {hasViolations && (
                              <div className="flex items-center space-x-1">
                                {essay.violation_logs.some((log: any) => log.type === "copy_paste") && (
                                  <span title="복사/붙여넣기 시도" className="text-red-500 text-lg">📋</span>
                                )}
                                {essay.violation_logs.some((log: any) => log.type === "profanity") && (
                                  <span title="비속어 사용" className="text-red-500 text-lg">🚫</span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {essay.violation_logs?.length || 0}건의 위반 감지
                          </span>
                        </div>
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-800 mb-2">작성한 글:</h4>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {essay.student_essay}
                            </p>
                          </div>
                        </div>
                        {essay.mindmap_data && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">마인드맵:</h4>
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
      </div>

      {/* 전체 대화 기록 (기존) */}
      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📋</span> 전체 대화 기록
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              총 대화 수: <span className="font-semibold">{conversationData.length}</span>
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">시간</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">학생</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">과목</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">참고자료</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">질문</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">안전성</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">승인</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">삭제</th>
              </tr>
            </thead>
            <tbody id="conversation-log" className="divide-y divide-gray-200">
              {conversationData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    아직 대화 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                conversationData.map((item) => {
                const timestamp =
                  item.timestamp instanceof Date
                    ? item.timestamp.toLocaleString("ko-KR")
                    : new Date((item.timestamp as any).toDate?.() || item.timestamp).toLocaleString("ko-KR");
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{timestamp}</td>
                    <td className="px-4 py-3 font-medium">
                      학생 {item.student_name} ({item.grade})
                    </td>
                    <td className="px-4 py-3">{item.subject}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={item.knowledge_title || "없음"}>
                      {item.knowledge_title || "없음"}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={item.question}>
                      {item.question}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.safety_status === "안전"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.safety_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          item.id && handleApprovalToggle(item.id, item.teacher_approved)
                        }
                        className={`px-3 py-1 text-xs rounded ${
                          item.teacher_approved
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700"
                        } hover:opacity-80`}
                      >
                        {item.teacher_approved ? "승인됨" : "승인"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {item.id && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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

