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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl sm:text-2xl">🧭</span>
            </div>
            <div>
              <h1 id="platform-title" className="text-lg sm:text-2xl font-bold leading-tight">
                배움나침반
              </h1>
              <p id="welcome-message" className="text-blue-100 text-xs sm:text-sm hidden sm:block">
                안전하고 즐거운 AI 학습을 시작해보세요!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 ml-12 sm:ml-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="safety-indicator bg-green-400 w-2 h-2 sm:w-3 sm:h-3 rounded-full"></div>
              <span className="text-xs sm:text-sm">안전 모드</span>
            </div>
            {showLogout && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm transition-colors"
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

