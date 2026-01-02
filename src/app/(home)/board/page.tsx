"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { ReportMetadata } from "@/lib/types/reports.type";
import ItemHeader from "@/components/board/ItemHeader";
import ItemOpen from "@/components/board/ItemOpen";
import EmptyState from "@/components/common/EmptyState";
import { useReportsByIds, useReportDetails } from "@/hooks/use-reports";

export default function PastMeetingsBoardPage() {
  const user = useAuthStore((state) => state.user);

  // 1. 회의 목록 가져오기 (React Query)
  const {
    data: reportMetadata = [],
    isLoading: isListLoading,
    isError: isListError,
  } = useReportsByIds(user?.roomReportIdxList);

  // 2. 선택된 회의 관리
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // 3. 진짜 데이터 상세 내용 가져오기 (React Query)
  const { data: reportDetails, isLoading: isDetailLoading } = useReportDetails(
    selectedReportId || undefined
  );

  // 선택 핸들러
  const handleSelect = (meeting: ReportMetadata) => {
    setSelectedReportId(meeting.reportId);
  };

  const handleClose = () => {
    setSelectedReportId(null);
  };

  // 로딩 중
  if (isListLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-400"></div>
          <p className="text-slate-600 dark:text-slate-400">회의록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (isListError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            회의록을 불러올 수 없습니다
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            문제가 지속되면 관리자에게 문의해주세요.
          </p>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!reportMetadata || reportMetadata.length === 0) {
    return (
      <div className="min-h-screen w-full bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">지난 회의록</h1>
            <p className="text-sm text-slate-500">
              목록에서 회의를 선택하면 전체 회의록을 볼 수 있습니다.
            </p>
          </div>
          <EmptyState
            title="아직 회의록이 없습니다."
            description="첫 회의를 시작해보세요!"
          />
        </div>
      </div>
    );
  }

  // 상세 내용 로딩 중
  if (isDetailLoading && selectedReportId) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-400"></div>
          <p className="text-slate-600 dark:text-slate-400">상세 내용 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 정상 데이터 표시
  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">지난 회의록</h1>
          <p className="text-sm text-slate-500">
            목록에서 회의를 선택하면 전체 회의록을 볼 수 있습니다. ({reportMetadata.length}개
            회의)
          </p>
        </div>

        <ItemHeader
          selected={reportDetails}
          onSelect={handleSelect}
          meetings={reportMetadata}
        />

        <ItemOpen selected={reportDetails} onClose={handleClose} />
      </div>
    </div>
  );
}
