import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "배움나침반 LearnCompass",
  description: "안전하고 즐거운 AI 학습을 시작해보세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full bg-gray-50">{children}</body>
    </html>
  );
}


