"use client";

import { useState } from "react";
import StudentInterface from "@/components/StudentInterface";
import TeacherInterface from "@/components/TeacherInterface";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  return (
    <div className="min-h-full">
      <header className="gradient-bg text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🧭</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">배움나침반 LearnCompass</h1>
                <p className="text-blue-100">안전하고 즐거운 AI 학습을 시작해보세요!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="safety-indicator bg-green-400 w-3 h-3 rounded-full"></div>
              <span className="text-sm">안전 모드 활성</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("student")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "student"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                👦 학생 학습
              </button>
              <button
                onClick={() => setActiveTab("teacher")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "teacher"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                👩‍🏫 교사 관리
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === "student" && <StudentInterface />}
        {activeTab === "teacher" && <TeacherInterface />}
      </main>
    </div>
  );
}
