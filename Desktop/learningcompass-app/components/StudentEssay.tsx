"use client";

import { useState, useRef, useEffect } from "react";
import { useFirebase } from "@/hooks/useFirebase";
import html2canvas from "html2canvas";

interface StudentEssayProps {
  studentNumber: string;
  grade: string;
  subject: string;
  learningObjective: string;
  conversations: any[];
}

export default function StudentEssay({
  studentNumber,
  grade,
  subject,
  learningObjective,
  conversations,
}: StudentEssayProps) {
  const { addConversation, updateConversation } = useFirebase();
  const [essay, setEssay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mindmapData, setMindmapData] = useState<any>(null);
  const [violationLogs, setViolationLogs] = useState<Array<{ type: string; timestamp: Date; detected_text?: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mindmapRef = useRef<HTMLDivElement>(null);
  const lastPasteTime = useRef<number>(0);
  const lastKeyTime = useRef<number>(0);

  // 기존 제출한 글 확인
  useEffect(() => {
    const existingEssay = conversations.find(
      (c: any) =>
        c.type === "essay" &&
        c.student_name === studentNumber &&
        c.essay_submitted === true
    );
    if (existingEssay) {
      setEssay(existingEssay.student_essay || "");
      setMindmapData(existingEssay.mindmap_data || null);
      setViolationLogs(existingEssay.violation_logs || []);
    }
  }, [conversations, studentNumber]);

  // 복사/붙여넣기 차단
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - lastPasteTime.current > 1000) {
        lastPasteTime.current = now;
        const newLog = {
          type: "copy_paste",
          timestamp: new Date(),
          detected_text: "붙여넣기 시도 감지",
        };
        setViolationLogs((prev) => [...prev, newLog]);
        alert("복사한 내용을 붙여넣을 수 없습니다. 직접 작성해주세요.");
      }
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (textarea === document.activeElement) {
        e.preventDefault();
        e.stopPropagation();
        alert("복사할 수 없습니다.");
        return false;
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (textarea === document.activeElement) {
        e.preventDefault();
        e.stopPropagation();
        alert("잘라내기를 할 수 없습니다.");
        return false;
      }
    };

    // 키보드 단축키 차단 (Ctrl+V, Ctrl+C, Ctrl+X, Shift+Insert)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isPaste = (e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V");
      const isCopy = (e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C");
      const isCut = (e.ctrlKey || e.metaKey) && (e.key === "x" || e.key === "X");
      const isShiftInsert = e.shiftKey && e.key === "Insert";

      if (isPaste || isShiftInsert) {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastPasteTime.current > 1000) {
          lastPasteTime.current = now;
          const newLog = {
            type: "copy_paste",
            timestamp: new Date(),
            detected_text: "붙여넣기 시도 감지 (키보드)",
          };
          setViolationLogs((prev) => [...prev, newLog]);
          alert("복사한 내용을 붙여넣을 수 없습니다. 직접 작성해주세요.");
        }
        return false;
      }

      if (isCopy || isCut) {
        if (textarea === document.activeElement) {
          e.preventDefault();
          e.stopPropagation();
          alert(isCopy ? "복사할 수 없습니다." : "잘라내기를 할 수 없습니다.");
          return false;
        }
      }
    };

    // 우클릭 메뉴 차단
    const handleContextMenu = (e: MouseEvent) => {
      if (textarea === e.target || textarea.contains(e.target as Node)) {
        e.preventDefault();
        return false;
      }
    };

    // 입력 속도 체크 및 붙여넣기 감지
    let lastLength = essay.length;
    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      const now = Date.now();
      const timeDiff = now - lastKeyTime.current;
      const lengthDiff = target.value.length - lastLength;
      lastKeyTime.current = now;

      // 100ms 이내에 5자 이상 입력되면 붙여넣기로 간주하고 롤백
      if (timeDiff < 100 && lengthDiff > 5) {
        // React state를 사용하여 롤백
        setTimeout(() => {
          setEssay(essay); // 이전 값으로 롤백
          if (textareaRef.current) {
            textareaRef.current.value = essay;
          }
        }, 0);
        const newLog = {
          type: "copy_paste",
          timestamp: new Date(),
          detected_text: "빠른 입력 감지 - 붙여넣기 차단",
        };
        setViolationLogs((prev) => [...prev, newLog]);
        alert("붙여넣기가 감지되어 차단되었습니다. 직접 작성해주세요.");
        return false;
      }
      lastLength = target.value.length;
    };

    // 이벤트 리스너 등록
    textarea.addEventListener("paste", handlePaste, true);
    textarea.addEventListener("copy", handleCopy, true);
    textarea.addEventListener("cut", handleCut, true);
    textarea.addEventListener("keydown", handleKeyDown, true);
    textarea.addEventListener("input", handleInput, true);
    textarea.addEventListener("contextmenu", handleContextMenu, true);

    // 전역 이벤트도 차단 (더 강력한 방지)
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (textarea === document.activeElement) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener("paste", handleGlobalPaste, true);

    return () => {
      textarea.removeEventListener("paste", handlePaste, true);
      textarea.removeEventListener("copy", handleCopy, true);
      textarea.removeEventListener("cut", handleCut, true);
      textarea.removeEventListener("keydown", handleKeyDown, true);
      textarea.removeEventListener("input", handleInput, true);
      textarea.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("paste", handleGlobalPaste, true);
    };
  }, [essay]);

  // 비속어 감지
  const checkProfanity = (text: string): boolean => {
    const profanityKeywords = [
      "바보",
      "멍청이",
      "미친",
      "죽어",
      "꺼져",
      "시발",
      "개새끼",
      "병신",
      "욕설",
    ];
    const textLower = text.toLowerCase();
    for (const keyword of profanityKeywords) {
      if (textLower.includes(keyword)) {
        const newLog = {
          type: "profanity",
          timestamp: new Date(),
          detected_text: keyword,
        };
        setViolationLogs((prev) => [...prev, newLog]);
        return true;
      }
    }
    return false;
  };

  const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEssay(newText);
    
    // 비속어 감지
    if (checkProfanity(newText)) {
      alert("바른 말을 사용해주세요.");
    }
  };

  const handleDownloadMindmap = async () => {
    if (!mindmapRef.current || !mindmapData) {
      alert("마인드맵을 다운로드할 수 없습니다.");
      return;
    }

    try {
      // html2canvas로 마인드맵 캡처
      const canvas = await html2canvas(mindmapRef.current, {
        backgroundColor: "#f9fafb", // bg-gray-50 색상
        scale: 2, // 고해상도
        logging: false,
      });

      // Canvas를 PNG로 변환
      const dataUrl = canvas.toDataURL("image/png");
      
      // 다운로드 링크 생성
      const link = document.createElement("a");
      const fileName = `마인드맵_${studentNumber}_${new Date().toISOString().split("T")[0]}.png`;
      link.download = fileName;
      link.href = dataUrl;
      
      // 다운로드 실행
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert("마인드맵이 다운로드되었습니다!");
    } catch (error) {
      console.error("마인드맵 다운로드 오류:", error);
      alert("마인드맵 다운로드에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSubmit = async () => {
    if (!essay.trim()) {
      alert("글을 작성해주세요.");
      return;
    }

    if (essay.trim().length < 50) {
      alert("최소 50자 이상 작성해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // AI 마인드맵 생성
      const response = await fetch("/api/generate-mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          essay: essay,
          grade: grade,
          subject: subject,
          learningObjective: learningObjective,
        }),
      });

      if (!response.ok) {
        throw new Error("마인드맵 생성에 실패했습니다.");
      }

      const data = await response.json();
      setMindmapData(data.mindmap);

      // Firebase에 저장
      const existingEssay = conversations.find(
        (c: any) =>
          c.type === "essay" &&
          c.student_name === studentNumber &&
          c.essay_submitted === true
      );

      const essayData = {
        type: "essay",
        student_name: studentNumber,
        grade: grade,
        subject: subject,
        learning_objective: learningObjective,
        student_essay: essay,
        mindmap_data: data.mindmap,
        essay_submitted: true,
        essay_timestamp: new Date().toISOString(),
        violation_logs: violationLogs,
        timestamp: new Date().toISOString(),
        teacher_approved: false,
        question: "",
        ai_response: "",
        safety_status: "안전",
      };

      if (existingEssay && existingEssay.id) {
        await updateConversation(existingEssay.id, essayData as any);
      } else {
        await addConversation(essayData as any);
      }

      alert("글이 제출되었습니다! 선생님이 확인하실 수 있습니다.");
    } catch (error: any) {
      console.error("제출 오류:", error);
      alert(`제출에 실패했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentNumber) {
    return (
      <div className="bg-white rounded-xl card-shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">✍️</span> 배운 내용 정리하기
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            학생 번호를 먼저 입력해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl card-shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">✍️</span> 배운 내용 정리하기
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            챗봇과의 대화를 바탕으로 배운 내용을 글로 작성해주세요
          </label>
          <textarea
            ref={textareaRef}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="챗봇과의 대화를 바탕으로 배운 내용을 직접 작성해주세요. (최소 50자 이상)"
            value={essay}
            onChange={handleEssayChange}
            disabled={isSubmitting}
            onPaste={(e) => {
              e.preventDefault();
              const now = Date.now();
              if (now - lastPasteTime.current > 1000) {
                lastPasteTime.current = now;
                const newLog = {
                  type: "copy_paste",
                  timestamp: new Date(),
                  detected_text: "붙여넣기 시도 감지 (React)",
                };
                setViolationLogs((prev) => [...prev, newLog]);
                alert("복사한 내용을 붙여넣을 수 없습니다. 직접 작성해주세요.");
              }
            }}
            onCopy={(e) => {
              e.preventDefault();
              alert("복사할 수 없습니다.");
            }}
            onCut={(e) => {
              e.preventDefault();
              alert("잘라내기를 할 수 없습니다.");
            }}
            onContextMenu={(e) => {
              e.preventDefault();
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {essay.length}자 / 최소 50자
            </p>
            {violationLogs.length > 0 && (
              <p className="text-xs text-red-500">
                ⚠️ 부적절한 행위 감지: {violationLogs.length}회
              </p>
            )}
          </div>
        </div>

        {mindmapData && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">마인드맵</h3>
              <button
                onClick={handleDownloadMindmap}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center space-x-2"
              >
                <span>📥</span>
                <span>PNG 다운로드</span>
              </button>
            </div>
            <div 
              ref={mindmapRef}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <MindmapVisualization data={mindmapData} />
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || essay.trim().length < 50}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "제출 중..." : "제출하기"}
        </button>
      </div>
    </div>
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

