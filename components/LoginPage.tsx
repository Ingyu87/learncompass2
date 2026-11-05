"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { teacherLogin } from "@/hooks/useFirebase";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null);
  const [name, setName] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedRole || !name.trim()) {
      alert("역할과 이름을 모두 입력해주세요.");
      return;
    }
    setError("");
    if (selectedRole === "teacher") {
      if (!teacherCode.trim()) {
        setError("교사 비밀번호를 입력해주세요.");
        return;
      }
      setLoading(true);
      try {
        await teacherLogin(teacherCode);
      } catch (err: any) {
        setError(err.message || "비밀번호가 올바르지 않습니다.");
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("userRole", selectedRole);
      sessionStorage.setItem("userName", name);
    }

    if (selectedRole === "student") {
      router.push("/student");
    } else {
      router.push("/teacher");
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-3 sm:px-4 py-6">
      <div className="bg-white rounded-2xl card-shadow p-5 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-3xl sm:text-4xl">🧭</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            배움나침반
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">안전하고 즐거운 AI 학습을 시작해보세요!</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* 역할 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              로그인 유형 선택
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setSelectedRole("student")}
                className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                  selectedRole === "student"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">👦</div>
                <div className="font-semibold text-gray-800 text-sm sm:text-base">학생</div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">AI와 함께 학습하기</div>
              </button>
              <button
                onClick={() => setSelectedRole("teacher")}
                className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
                  selectedRole === "teacher"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">👩‍🏫</div>
                <div className="font-semibold text-gray-800 text-sm sm:text-base">교사</div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1">대화 관리하기</div>
              </button>
            </div>
          </div>

          {/* 이름 입력 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {selectedRole === "student" ? "학생 이름" : "교사 이름"}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                selectedRole === "student" ? "이름을 입력하세요" : "교사 이름을 입력하세요"
              }
            />
          </div>

          {selectedRole === "teacher" && (
            <div>
              <label htmlFor="teacher-code" className="block text-sm font-medium text-gray-700 mb-2">
                교사 비밀번호
              </label>
              <input
                type="password"
                id="teacher-code"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="교사 비밀번호를 입력하세요"
              />
            </div>
          )}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            disabled={!selectedRole || !name.trim() || loading}
            className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
              selectedRole && name.trim()
                ? selectedRole === "student"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {selectedRole === "student" ? "학습 시작하기" : "대시보드 접속"}
          </button>
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500">
            <span className="safety-indicator bg-green-400 w-2 h-2 rounded-full"></span>
            <span>안전 모드 활성</span>
          </div>
        </div>
      </div>
    </div>
  );
}


