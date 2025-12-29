"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const CreateMeetingStep = () => {
  const pathname = usePathname();

  // 각 단계별 활성화 여부판단
  const isFirst = pathname.includes("/create/first");
  const isSecond = pathname.includes("/create/second");
  const isThird = pathname === "/create"; // 사용자가 원한 로직 (create일 때 3단계)

  return (
    <div className="flex items-center gap-4 text-sm font-medium">
      {/* Step 1: 데이터 선택 */}
      <div
        className={cn(
          "flex items-center gap-2",
          isFirst ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
        )}
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            isFirst ? "bg-blue-100 dark:bg-blue-900" : "border border-slate-300"
          )}
        >
          1
        </span>
        <span>데이터 선택</span>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-300" />

      {/* Step 2: 에이전트 설정 */}
      <div
        className={cn(
          "flex items-center gap-2",
          isSecond ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
        )}
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            isSecond ? "bg-blue-100 dark:bg-blue-900" : "border border-slate-300"
          )}
        >
          2
        </span>
        <span>에이전트 설정</span>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-300" />

      {/* Step 3: 완료 */}
      <div
        className={cn(
          "flex items-center gap-2",
          isThird ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
        )}
      >
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            isThird ? "bg-blue-100 dark:bg-blue-900" : "border border-slate-300"
          )}
        >
          3
        </span>
        <span>완료</span>
      </div>
    </div>
  );
};

export default CreateMeetingStep;
