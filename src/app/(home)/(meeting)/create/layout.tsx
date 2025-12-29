"use client";

import CreateHeader from "@/components/create/CreateHeader";
import CreateMeetingStep from "@/components/create/CreateMeetingStep";
import { usePathname } from "next/navigation";

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  let title = "Create Meeting";
  let description =
    "지난 회의 데이터를 기반으로 AI 에이전트를 학습시킵니다. 학습할 회의 내용을 선택해주세요.";

  // URL 경로에 따른 헤더 텍스트 변경
  if (pathname.includes("/create/second")) {
    title = "Ai Customer";
    description = "회의에 참여시킬 AI의 성격 및 기능을 선택할 수 있습니다.";
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header Section */}
      <div className="mx-auto max-w-4xl space-y-8">
        <CreateHeader title={title} description={description} />
        {/* 회의 생성 진행 단계 */}
        <CreateMeetingStep />
        {children}
      </div>
    </div>
  );
}
