"use client";

import { useState, useRef, useEffect } from "react";

interface LearningConfig {
  studentNumber: string;
  grade: string;
  subject: string;
  learningObjective: string;
  knowledgeId: string;
}

interface ChatInterfaceProps {
  learningConfig: LearningConfig;
  onConversationCreate: (conversation: any) => Promise<void>;
  knowledgeData?: any[];
}

interface Message {
  sender: "user" | "ai";
  content: string;
}

export default function ChatInterface({
  learningConfig,
  onConversationCreate,
  knowledgeData = [],
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

  const checkSafety = (question: string, learningObjective: string) => {
    const inappropriateKeywords = [
      "개인정보",
      "주소",
      "전화번호",
      "비밀번호",
      "폭력",
      "욕설",
    ];
    const questionLower = question.toLowerCase();

    for (let keyword of inappropriateKeywords) {
      if (questionLower.includes(keyword)) {
        return { safe: false, reason: "부적절한 내용 포함" };
      }
    }

    if (learningObjective && question.length > 5) {
      return { safe: true, reason: "안전" };
    }

    return { safe: false, reason: "학습 목표와 무관" };
  };

  const handleSubmit = async () => {
    if (isLoading || !question.trim()) return;

    if (!isConfigComplete) {
      setSafetyWarning("모든 정보를 입력해주세요.");
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

    try {
      // Get knowledge context if selected
      let knowledgeContext = null;
      let knowledgeTitle = null;
      
      if (learningConfig.knowledgeId) {
        const knowledgeItem = knowledgeData.find(
          (item: any) => (item.id || item.__backendId) === learningConfig.knowledgeId
        );
        if (knowledgeItem) {
          knowledgeContext = knowledgeItem.knowledge_content;
          knowledgeTitle = knowledgeItem.knowledge_title;
        }
      }

      // Gemini API 호출
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          subject: learningConfig.subject,
          grade: learningConfig.grade,
          learningObjective: learningConfig.learningObjective,
          knowledgeContext,
        }),
      });

      const data = await response.json();
      const aiResponse = data.response || "죄송해요, 답변을 생성하는데 문제가 생겼어요.";

      // AI 메시지 추가
      const aiMessage: Message = { sender: "ai", content: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);

      // Firebase에 저장
      await onConversationCreate({
        type: "conversation",
        student_name: learningConfig.studentNumber,
        grade: learningConfig.grade,
        subject: learningConfig.subject,
        learning_objective: learningConfig.learningObjective,
        question: userMessage.content,
        ai_response: aiResponse,
        safety_status: safetyCheck.reason,
        teacher_approved: false,
        knowledge_title: knowledgeTitle || "",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("오류 발생:", error);
      setSafetyWarning("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentObjective = isConfigComplete
    ? `${learningConfig.grade} ${learningConfig.subject} - ${learningConfig.learningObjective}`
    : "학습 목표를 설정하면 AI와 대화할 수 있어요!";

  return (
    <div className="bg-white rounded-xl card-shadow h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🤖</span> AI 학습 도우미
        </h2>
        <div id="current-objective" className="text-sm text-gray-600 mt-1">
          {currentObjective}
        </div>
      </div>
      <div
        id="chat-messages"
        className="flex-1 p-4 overflow-y-auto space-y-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                msg.sender === "user" ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              <span className="text-sm">{msg.sender === "user" ? "👦" : "🤖"}</span>
            </div>
            <div
              className={`rounded-lg p-3 max-w-md ${
                msg.sender === "user" ? "bg-green-50" : "bg-blue-50"
              }`}
            >
              <p className="text-sm text-gray-800">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            id="user-question"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!isConfigComplete || isLoading}
          >
            {isLoading ? "전송 중..." : "전송"}
          </button>
        </div>
        {safetyWarning && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            ⚠️ {safetyWarning}
          </div>
        )}
      </div>
    </div>
  );
}
