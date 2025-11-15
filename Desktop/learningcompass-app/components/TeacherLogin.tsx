"use client";

import { useState } from "react";

interface TeacherLoginProps {
  onLogin: () => void;
}

export default function TeacherLogin({ onLogin }: TeacherLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호만 확인
    if (password === "2025") {
      setError("");
      onLogin();
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="bg-white rounded-xl card-shadow p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👩‍🏫</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">교사 로그인</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="teacher-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="teacher-password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          로그인
        </button>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}


