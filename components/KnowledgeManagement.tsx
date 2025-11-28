"use client";

import { useState, useEffect } from "react";
import { useFirebase } from "@/hooks/useFirebase";
import {
  loadCurriculumData,
  getStandardsBySubjectGradeAndArea,
  type CurriculumStandard,
} from "@/lib/curriculum";

export default function KnowledgeManagement({ conversations }: { conversations: any[] }) {
  const { addConversation, deleteConversation, updateConversation } = useFirebase();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    grade: "",
    subject: "",
    learningObjective: "",
    content: "",
  });
  const [availableStandards, setAvailableStandards] = useState<CurriculumStandard[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  const knowledgeData = conversations.filter((item: any) => item.type === "knowledge");

  // 성취기준 데이터 로드 및 필터링
  useEffect(() => {
    const loadStandards = async () => {
      if (formData.grade && formData.subject) {
        try {
          const standards = await getStandardsBySubjectGradeAndArea(
            formData.subject,
            formData.grade
          );
          setAvailableStandards(standards);
          
          // 영역 목록 추출
          const areas = [...new Set(standards.map((s) => s.영역))].sort();
          setAvailableAreas(areas);
        } catch (error) {
          console.error("성취기준 로드 오류:", error);
        }
      } else {
        setAvailableStandards([]);
        setAvailableAreas([]);
      }
    };

    loadStandards();
  }, [formData.grade, formData.subject]);

  // 영역 선택 시 성취기준 필터링
  useEffect(() => {
    const loadFilteredStandards = async () => {
      if (formData.grade && formData.subject) {
        try {
          const standards = await getStandardsBySubjectGradeAndArea(
            formData.subject,
            formData.grade,
            selectedArea || undefined
          );
          setAvailableStandards(standards);
        } catch (error) {
          console.error("성취기준 필터링 오류:", error);
        }
      }
    };

    loadFilteredStandards();
  }, [formData.grade, formData.subject, selectedArea]);

  const handleUpload = async () => {
    if (!formData.title || !formData.grade || !formData.subject) {
      alert("자료 제목, 학년, 과목을 모두 입력해주세요.");
      return;
    }

    if (!formData.content.trim()) {
      alert("학습 내용을 입력해주세요.");
      return;
    }

    setIsUploading(true);

    try {
      const content = formData.content;

      // AI로 성취기준 분석 및 루브릭 생성
      alert("지식 내용을 분석하여 성취기준과 평가 루브릭을 생성 중입니다...");
      const analysisResponse = await fetch("/api/analyze-knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          grade: formData.grade,
          subject: formData.subject,
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || "성취기준 분석에 실패했습니다.");
      }

      const analysisData = await analysisResponse.json();

      const knowledgeData = {
        type: "knowledge",
        knowledge_title: formData.title,
        knowledge_content: content,
        content_type: "text",
        upload_date: new Date().toISOString(),
        learning_objective: analysisData.achievement_standard_text,
        grade: formData.grade,
        subject: formData.subject, // 교사가 선택한 교과명 사용
        area: analysisData.area,
        achievement_standard: analysisData.achievement_standard,
        achievement_standard_text: analysisData.achievement_standard_text,
        rubric: analysisData.rubric,
        selected: false, // 기본값: 선택되지 않음
      };

      await addConversation(knowledgeData as any);

      // Reset form
      setFormData({ title: "", grade: "", subject: "", learningObjective: "", content: "" });
      setSelectedArea("");
      alert("지식 자료가 성공적으로 업로드되었습니다!\n성취기준과 평가 루브릭이 자동으로 생성되었습니다.");
    } catch (error: any) {
      console.error("업로드 오류:", error);
      alert(`지식 자료 업로드에 실패했습니다: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteConversation(id);
        alert("지식 자료가 삭제되었습니다.");
      } catch (error) {
        console.error("삭제 오류:", error);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const handleSelectKnowledge = async (id: string, currentSelected: boolean) => {
    try {
      // 다른 지식의 선택 해제
      const otherKnowledge = knowledgeData.filter((k: any) => k.id !== id && k.selected);
      for (const k of otherKnowledge) {
        await updateConversation(k.id || k.__backendId, { selected: false });
      }
      
      // 현재 지식 선택/해제
      await updateConversation(id, { selected: !currentSelected });
      alert(!currentSelected ? "지식이 선택되었습니다. 학생 화면에 표시됩니다." : "지식 선택이 해제되었습니다.");
    } catch (error) {
      console.error("선택 오류:", error);
      alert("선택에 실패했습니다.");
    }
  };

  const exportKnowledge = () => {
    const csvContent = [
      ["업로드날짜", "자료제목", "파일명", "유형", "내용"],
      ...knowledgeData.map((item: any) => [
        new Date(item.upload_date).toLocaleDateString("ko-KR"),
        item.knowledge_title,
        item.file_name || "직접입력",
        item.content_type === "text" ? "텍스트" : "PDF",
        item.knowledge_content,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `배움나침반_지식자료_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <>
      {/* Knowledge Upload Section */}
      <div className="bg-white rounded-xl card-shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <span className="mr-2">📖</span> 지식 자료 업로드
        </h2>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label
              htmlFor="knowledge-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              자료 제목
            </label>
            <input
              type="text"
              id="knowledge-title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="예: 4학년 사회-2단원"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="knowledge-grade"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              학년
            </label>
            <select
              id="knowledge-grade"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
            >
              <option value="">학년 선택</option>
              <option value="1학년">1학년</option>
              <option value="2학년">2학년</option>
              <option value="3학년">3학년</option>
              <option value="4학년">4학년</option>
              <option value="5학년">5학년</option>
              <option value="6학년">6학년</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="knowledge-subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              과목
            </label>
            <select
              id="knowledge-subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            >
              <option value="">과목 선택</option>
              <option value="국어">국어</option>
              <option value="수학">수학</option>
              <option value="과학">과학</option>
              <option value="사회">사회</option>
              <option value="영어">영어</option>
              <option value="미술">미술</option>
              <option value="음악">음악</option>
              <option value="체육">체육</option>
            </select>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>💡 안내:</strong> 학습 내용을 입력하면 AI가 선택한 교과에 맞는 성취기준을 찾고 평가 루브릭을 생성합니다.
            </p>
          </div>
          <div>
            <label
              htmlFor="knowledge-content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              학습 내용
            </label>
            <textarea
              id="knowledge-content"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              placeholder="학습 목표와 관련된 지식 내용을 입력하세요..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isUploading ? "업로드 중..." : "지식 자료 저장"}
          </button>
        </div>
      </div>

      {/* Knowledge Management Dashboard */}
      <div className="bg-white rounded-xl card-shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📚</span> 지식 자료 관리
          </h2>
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3 sm:space-x-4">
            <span className="text-xs sm:text-sm text-gray-600">
              총 <span className="font-semibold">{knowledgeData.length}</span>개
            </span>
            <button
              onClick={exportKnowledge}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
            >
              내보내기
            </button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[500px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">
                  날짜
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">
                  제목
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700 hidden sm:table-cell">
                  학년
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700 hidden sm:table-cell">
                  과목
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700 hidden md:table-cell">
                  미리보기
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">
                  선택
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-700">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {knowledgeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-2 sm:px-4 py-6 sm:py-8 text-center text-gray-500"
                  >
                    아직 업로드된 지식 자료가 없습니다.
                  </td>
                </tr>
              ) : (
                knowledgeData.map((item: any) => (
                  <tr key={item.id || item.__backendId} className={`hover:bg-gray-50 ${item.selected ? "bg-yellow-50" : ""}`}>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 whitespace-nowrap text-[10px] sm:text-sm">
                      {new Date(item.upload_date).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium max-w-[80px] sm:max-w-none truncate">
                      {item.knowledge_title}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      {item.grade || "-"}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      {item.subject || "-"}
                    </td>
                    <td
                      className="px-2 sm:px-4 py-2 sm:py-3 max-w-xs truncate hidden md:table-cell"
                      title={item.knowledge_content}
                    >
                      {item.knowledge_content.substring(0, 50)}
                      {item.knowledge_content.length > 50 ? "..." : ""}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <button
                        onClick={() =>
                          handleSelectKnowledge(item.id || item.__backendId, item.selected || false)
                        }
                        className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs rounded ${
                          item.selected
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {item.selected ? "선택" : "선택"}
                      </button>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <button
                        onClick={() =>
                          handleDelete(item.id || item.__backendId)
                        }
                        className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

