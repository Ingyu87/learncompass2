"use client";

import { useState } from "react";
import { useFirebase } from "@/hooks/useFirebase";

export default function KnowledgeManagement({ conversations }: { conversations: any[] }) {
  const { addConversation, deleteConversation } = useFirebase();
  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("text");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    learningObjective: "",
    content: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const knowledgeData = conversations.filter((item: any) => item.type === "knowledge");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("파일 크기는 5MB 이하여야 합니다.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file, "UTF-8");
    });
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.learningObjective) {
      alert("자료 제목과 학습 목표를 입력해주세요.");
      return;
    }

    setIsUploading(true);

    try {
      let content = "";
      let fileName = "";
      let contentType = "text";

      if (uploadMethod === "text") {
        if (!formData.content.trim()) {
          alert("학습 내용을 입력해주세요.");
          setIsUploading(false);
          return;
        }
        content = formData.content;
      } else {
        if (!selectedFile) {
          alert("파일을 선택해주세요.");
          setIsUploading(false);
          return;
        }
        fileName = selectedFile.name;
        if (selectedFile.type === "text/plain" || selectedFile.name.endsWith(".txt")) {
          content = await readTextFile(selectedFile);
          contentType = "text";
        } else if (
          selectedFile.type === "application/pdf" ||
          selectedFile.name.endsWith(".pdf")
        ) {
          content = `PDF 파일이 업로드되었습니다: ${selectedFile.name}\n파일 크기: ${(selectedFile.size / 1024).toFixed(2)}KB\n업로드 시간: ${new Date().toLocaleString()}`;
          contentType = "pdf";
        } else {
          alert("TXT 또는 PDF 파일만 지원됩니다.");
          setIsUploading(false);
          return;
        }
      }

      const knowledgeData = {
        type: "knowledge",
        knowledge_title: formData.title,
        knowledge_content: content,
        file_name: fileName,
        content_type: contentType,
        upload_date: new Date().toISOString(),
        learning_objective: formData.learningObjective,
      };

      await addConversation(knowledgeData as any);

      // Reset form
      setFormData({ title: "", learningObjective: "", content: "" });
      setSelectedFile(null);
      alert("지식 자료가 성공적으로 업로드되었습니다!");
    } catch (error) {
      console.error("업로드 오류:", error);
      alert("지식 자료 업로드에 실패했습니다.");
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
      <div className="bg-white rounded-xl card-shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📖</span> 지식 자료 업로드
        </h2>
        <div className="space-y-4">
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
              placeholder="예: 3학년 수학 - 분수의 개념"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="knowledge-learning-objective"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              학습 목표
            </label>
            <textarea
              id="knowledge-learning-objective"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="이 자료와 관련된 학습 목표를 입력하세요"
              value={formData.learningObjective}
              onChange={(e) =>
                setFormData({ ...formData, learningObjective: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              업로드 방법 선택
            </label>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="upload-method"
                  value="text"
                  checked={uploadMethod === "text"}
                  onChange={() => setUploadMethod("text")}
                  className="mr-2"
                />
                <span className="text-sm">텍스트 직접 입력</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="upload-method"
                  value="file"
                  checked={uploadMethod === "file"}
                  onChange={() => setUploadMethod("file")}
                  className="mr-2"
                />
                <span className="text-sm">파일 업로드</span>
              </label>
            </div>
          </div>

          {uploadMethod === "text" ? (
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="학습 목표와 관련된 지식 내용을 입력하세요..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="knowledge-file"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                파일 선택
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="knowledge-file"
                  accept=".txt,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="knowledge-file"
                  className="cursor-pointer block"
                >
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    클릭하거나 파일을 드래그하여 업로드
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    TXT, PDF 파일만 지원 (최대 5MB)
                  </p>
                </label>
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    선택된 파일: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(2)}KB)
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isUploading ? "업로드 중..." : "지식 자료 저장"}
          </button>
        </div>
      </div>

      {/* Knowledge Management Dashboard */}
      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-2">📚</span> 지식 자료 관리
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              총 자료 수: <span className="font-semibold">{knowledgeData.length}</span>
            </span>
            <button
              onClick={exportKnowledge}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              자료 내보내기
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  업로드 날짜
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  자료 제목
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  파일명
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  유형
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  내용 미리보기
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {knowledgeData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    아직 업로드된 지식 자료가 없습니다.
                  </td>
                </tr>
              ) : (
                knowledgeData.map((item: any) => (
                  <tr key={item.id || item.__backendId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(item.upload_date).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.knowledge_title}
                    </td>
                    <td className="px-4 py-3">
                      {item.file_name || "직접 입력"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.content_type === "text"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.content_type === "text" ? "텍스트" : "PDF"}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 max-w-xs truncate"
                      title={item.knowledge_content}
                    >
                      {item.knowledge_content.substring(0, 50)}
                      {item.knowledge_content.length > 50 ? "..." : ""}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleDelete(item.id || item.__backendId)
                        }
                        className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
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

