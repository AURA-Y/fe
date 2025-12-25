import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA - AI Team Member",
  description: "AI 기반 음성 대화 커뮤니티 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const bgImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?..."; // 생략

  return (
    <html lang="ko">
      {/* 🔥 전체 화면 배경 */}
      <body
        style={{ backgroundImage: `url(${bgImage})` }}
        className="mx-auto max-h-screen font-sans"
      >
        <main className="mx-auto min-h-screen w-full">{children}</main>
      </body>
    </html>
  );
}
