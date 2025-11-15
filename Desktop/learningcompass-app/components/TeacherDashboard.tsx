"use client";

import { Conversation, useFirebase } from "@/hooks/useFirebase";

interface TeacherDashboardProps {
  conversations: Conversation[];
  onApprovalToggle: (id: string, updates: Partial<Conversation>) => Promise<void>;
  onLogout?: () => void;
}

export default function TeacherDashboard({
  conversations,
  onApprovalToggle,
  onLogout,
}: TeacherDashboardProps) {
  const handleApprovalToggle = async (id: string, currentStatus: boolean) => {
    const conversation = conversations.find((c: any) => c.id === id || c.__backendId === id);
    
    if (!currentStatus && conversation) {
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

  const exportData = () => {
    const conversationData = conversations.filter(
      (item: any) => item.type === "conversation" || !item.type
    );
    const csvContent = [
      ["시간", "학생번호", "학년", "과목", "참고자료", "질문", "AI응답", "안전성", "승인여부"],
      ...conversationData.map((item) => {
        const timestamp =
          item.timestamp instanceof Date
            ? item.timestamp.toLocaleString("ko-KR")
            : new Date((item.timestamp as any).toDate?.() || item.timestamp).toLocaleString("ko-KR");
        return [
          timestamp,
                    item.student_name,
                    item.grade,
                    item.subject,
                    item.knowledge_title || "없음",
          item.question,
          item.ai_response,
          item.safety_status,
          item.teacher_approved ? "승인됨" : "미승인",
        ];
      }),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `배움나침반_대화기록_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

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

      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">👩‍🏫</span> 대화 기록 관리
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              총 대화 수: <span className="font-semibold">{conversationData.length}</span>
            </span>
            <button
              id="export-data"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              onClick={exportData}
            >
              대화 내보내기
            </button>
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
              </tr>
            </thead>
            <tbody id="conversation-log" className="divide-y divide-gray-200">
              {conversationData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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

