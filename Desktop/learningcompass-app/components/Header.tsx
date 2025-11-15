"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userName");
      router.push("/login");
    }
  };

  const showLogout = pathname === "/student" || pathname === "/teacher";

  return (
    <header className="gradient-bg text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🧭</span>
            </div>
            <div>
              <h1 id="platform-title" className="text-2xl font-bold">
                배움나침반 LearnCompass
              </h1>
              <p id="welcome-message" className="text-blue-100">
                안전하고 즐거운 AI 학습을 시작해보세요!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="safety-indicator bg-green-400 w-3 h-3 rounded-full"></div>
              <span className="text-sm">안전 모드 활성</span>
            </div>
            {showLogout && (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

