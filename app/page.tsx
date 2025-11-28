"use client";

import { useState } from "react";
import StudentInterface from "@/components/StudentInterface";
import TeacherInterface from "@/components/TeacherInterface";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"student" | "teacher">("student");

  return (
    <div className="min-h-full">
      <header className="gradient-bg text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">🧭</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold leading-tight">배움나침반</h1>
                <p className="text-blue-100 text-xs sm:text-sm hidden sm:block">안전하고 즐거운 AI 학습을 시작해보세요!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-12 sm:ml-0">
              <div className="safety-indicator bg-green-400 w-2 h-2 sm:w-3 sm:h-3 rounded-full"></div>
              <span className="text-xs sm:text-sm">안전 모드</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("student")}
                className={`flex-1 sm:flex-none py-3 sm:py-2 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === "student"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">👦 </span>학생 학습
              </button>
              <button
                onClick={() => setActiveTab("teacher")}
                className={`flex-1 sm:flex-none py-3 sm:py-2 px-3 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === "teacher"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">👩‍🏫 </span>교사 관리
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
