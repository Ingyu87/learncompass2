"use client";

import { useState, useRef, useEffect } from "react";

interface LearningConfig {
  studentNumber: string;
  grade: string;
  subject: string;
  learningObjective: string;
}

interface ChatInterfaceProps {
  learningConfig: LearningConfig;
  onConversationCreate: (conversation: any) => Promise<void>;
  conversations?: any[]; // 승인된 대화 확인용 (실시간 업데이트)
  knowledgeContent?: string; // RAG: 교사가 업로드한 지식 내용
  knowledgeTitle?: string; // 선택된 지식 제목
}

interface Message {
  sender: "user" | "ai";
  content: string;
}

export default function ChatInterface({
  learningConfig,
  onConversationCreate,
  conversations = [],
  knowledgeContent = "", // RAG: 지식 내용
  knowledgeTitle = "", // 선택된 지식 제목
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      content:
        "안녕하세요! 저는 여러분의 학습을 도와주는 AI 선생님이에요. 먼저 학습 설정을 완료해주세요!",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [safetyWarning, setSafetyWarning] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isConfigComplete =
    learningConfig.studentNumber &&
    learningConfig.grade &&
    learningConfig.subject &&
    learningConfig.learningObjective;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 승인된 대화 확인 및 응답 표시
  useEffect(() => {
    if (!learningConfig.studentNumber) return;

    const myConversations = conversations.filter(
      (c: any) => 
        (c.type === "conversation" || !c.type) && 
        c.student_name === learningConfig.studentNumber &&
        c.teacher_approved === true &&
        c.ai_response &&
        c.ai_response.trim() !== ""
    );

    // 승인된 대화가 있으면 메시지 업데이트
    myConversations.forEach((conv: any) => {
      // 이미 표시된 메시지인지 확인
      const questionExists = messages.some(
        (msg) => msg.sender === "user" && msg.content === conv.question
      );
      const responseExists = messages.some(
        (msg) => msg.sender === "ai" && msg.content === conv.ai_response
      );

      if (questionExists && !responseExists) {
        // 대기 메시지 제거하고 실제 응답 추가
        setMessages((prev) => {
          const filtered = prev.filter(
            (msg) => !msg.content.includes("승인 전입니다")
          );
          return [
            ...filtered,
            { sender: "ai", content: conv.ai_response },
          ];
        });
      }
    });
  }, [conversations, learningConfig.studentNumber, messages]);

  const checkSafety = (question: string, learningObjective: string) => {
    // 비속어 및 부적절한 키워드 체크
    const inappropriateKeywords = [
      "개인정보",
      "주소",
      "전화번호",
      "비밀번호",
      "폭력",
      "욕설",
      "바보",
      "멍청이",
      "미친",
      "죽어",
      "꺼져",
      "시발",
      "개새끼",
      "병신",
    ];
    const questionLower = question.toLowerCase();

    for (let keyword of inappropriateKeywords) {
      if (questionLower.includes(keyword)) {
        return { safe: false, reason: "부적절한 언어 사용" };
      }
    }

    // 기본 검증: 질문이 너무 짧거나 비어있으면 안됨
    if (!learningObjective || question.trim().length < 3) {
      return { safe: false, reason: "질문을 정확히 입력해주세요" };
    }

    // 기본 안전 통과 (실제 내용 검증은 AI가 수행)
    return { safe: true, reason: "안전" };
  };

  const handleSubmit = async () => {
    if (isLoading || !question.trim()) return;

    if (!isConfigComplete) {
      if (!learningConfig.studentNumber) {
        setSafetyWarning("학생 번호를 먼저 입력해주세요.");
      } else {
        setSafetyWarning("모든 정보를 입력해주세요.");
      }
      return;
    }

    const safetyCheck = checkSafety(
      question,
      learningConfig.learningObjective
    );
    if (!safetyCheck.safe) {
      setSafetyWarning(safetyCheck.reason);
      return;
    }

    setIsLoading(true);
    setSafetyWarning("");

    // 사용자 메시지 추가
    const userMessage: Message = { sender: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");

    // 승인 대기 메시지 추가
    const waitingMessage: Message = { 
      sender: "ai", 
      content: "승인 전입니다. 대기해주세요. 선생님의 승인 후 답변을 드리겠습니다." 
    };
    setMessages((prev) => [...prev, waitingMessage]);

    try {
      // Firebase에 저장 (승인 대기 상태)
      await onConversationCreate({
        type: "conversation",
        student_name: learningConfig.studentNumber,
        grade: learningConfig.grade,
        subject: learningConfig.subject,
        learning_objective: learningConfig.learningObjective,
        question: userMessage.content,
        ai_response: "", // 승인 전에는 빈 응답
        safety_status: safetyCheck.reason,
        teacher_approved: false,
        knowledge_title: knowledgeTitle || "", // 선택된 지식 제목 저장
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("오류 발생:", error);
      const errorMessage = error?.message || "오류가 발생했습니다. 다시 시도해주세요.";
      setSafetyWarning(errorMessage);
      
      // 대기 메시지 제거
      setMessages((prev) => 
        prev.filter((msg) => !msg.content.includes("승인 전입니다"))
      );
      
      // 에러 메시지를 AI 메시지로도 표시
      const errorAiMessage: Message = {
        sender: "ai",
        content: `죄송해요, ${errorMessage} 다시 시도해주세요!`,
      };
      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentObjective = isConfigComplete
    ? `${learningConfig.grade} ${learningConfig.subject} - ${learningConfig.learningObjective}`
    : !learningConfig.studentNumber
    ? "학생 번호를 입력하면 AI와 대화할 수 있어요!"
    : "학습 목표를 설정하면 AI와 대화할 수 있어요!";

  return (
    <div className="bg-white rounded-xl card-shadow h-[60vh] sm:h-96 flex flex-col">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🤖</span> AI 학습 도우미
        </h2>
        <div id="current-objective" className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
          {currentObjective}
        </div>
      </div>
      <div
        id="chat-messages"
        className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 sm:space-x-3 ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.sender === "user" ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              <span className="text-xs sm:text-sm">{msg.sender === "user" ? "👦" : "🤖"}</span>
            </div>
            <div
              className={`rounded-lg p-2 sm:p-3 max-w-[85%] sm:max-w-md ${
                msg.sender === "user" ? "bg-green-50" : "bg-blue-50"
              }`}
            >
              <p className="text-xs sm:text-sm text-gray-800 break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            id="user-question"
            className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="궁금한 것을 물어보세요..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={!isConfigComplete || isLoading}
          />
          <button
            id="send-question"
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
            onClick={handleSubmit}
            disabled={!isConfigComplete || isLoading}
          >
            {isLoading ? "..." : "전송"}
          </button>
        </div>
        {safetyWarning && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs sm:text-sm text-red-700">
            ⚠️ {safetyWarning}
          </div>
        )}
      </div>
    </div>
  );
}
