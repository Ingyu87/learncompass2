"use client";

import { useState } from "react";

interface TeacherLoginProps {
  onLogin: () => void;
}

export default function TeacherLogin({ onLogin }: TeacherLoginProps) {
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple demo authentication
    if (teacherId === "teacher" && password === "admin123") {
      setError("");
      onLogin();
    } else {
      setError("로그인 정보가 올바르지 않습니다.");
    }
  };

  return (
    <div className="bg-white rounded-xl card-shadow p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">👩‍🏫</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">교사 로그인</h2>
        <p className="text-gray-600 mt-2">관리자 권한이 필요합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="teacher-id"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            교사 ID
          </label>
          <input
            type="text"
            id="teacher-id"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="교사 ID를 입력하세요"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
          />
        </div>
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

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">데모 계정</h3>
        <p className="text-sm text-gray-600">ID: teacher</p>
        <p className="text-sm text-gray-600">비밀번호: admin123</p>
      </div>
    </div>
  );
}

