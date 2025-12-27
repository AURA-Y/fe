import type { Metadata } from "next";
import "./globals.css";
import Providers from "./provider";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "AURA - AI Team Member",
  description: "AI 기반 음성 대화 커뮤니티 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="w-full bg-white font-sans text-slate-900 antialiased">
        <Providers>
          <div className="mx-auto flex min-h-screen flex-col">
            {/* Header Configuration matching the provided design */}
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
