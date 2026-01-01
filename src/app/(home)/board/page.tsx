"use client";

import { useState } from "react";
import { PAST_MEETINGS, PastMeeting } from "@/mock/board/mockData";
import { useAuthStore } from "@/lib/store/auth.store";
import { ReportMetadata, ReportDetails } from "@/lib/types/reports.type";
import ItemHeader from "@/components/board/ItemHeader";
import ItemOpen from "@/components/board/ItemOpen";
import { useReportsByIds, useReportDetails } from "@/hooks/use-reports";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );

export default function PastMeetingsBoardPage() {
  const user = useAuthStore((state) => state.user);

  // 1. 회의 목록 가져오기 (React Query)
  const { data: reportMetadata = [], isLoading: isListLoading } = useReportsByIds(
    user?.roomReportIdxList
  );

  // 2. 선택된 회의 관리
  // selectedId가 있으면 상세 내용을 불어옵니다. (Mock 데이터인 경우 selectedMock에 저장)
  const [selectedMock, setSelectedMock] = useState<PastMeeting | null>(null);
  const [selectedRealId, setSelectedRealId] = useState<string | null>(null);

  // 3. 진짜 데이터 상세 내용 가져오기 (React Query)
  // selectedRealId가 있을 때만 자동으로 fetching 됩니다.
  const { data: realDetails, isLoading: isDetailLoading } = useReportDetails(
    selectedRealId || undefined
  );

  // 선택 핸들러
  const handleSelect = (meeting: PastMeeting | ReportMetadata) => {
    if ("title" in meeting) {
      // Mock 데이터 선택 시
      setSelectedMock(meeting);
      setSelectedRealId(null); // 진짜 선택 해제
    } else {
      // Real 데이터 선택 시
      setSelectedRealId(meeting.reportId);
      setSelectedMock(null); // Mock 선택 해제
    }
  };

  const handleClose = () => {
    setSelectedMock(null);
    setSelectedRealId(null);
  };

  // 현재 보여줄 상세 내용 (Mock이 선택되었으면 Mock, 아니면 Real)
  const selectedDisplay = selectedMock || realDetails || null;

  // 전체 목록 합치기
  const allMeetings = [...reportMetadata, ...PAST_MEETINGS];

  if (isListLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-900 dark:text-slate-100">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">지난 회의록</h1>
          <p className="text-sm text-slate-500">
            목록에서 회의를 선택하면 전체 회의록을 볼 수 있습니다. ({allMeetings.length}개 회의)
          </p>
        </div>

        <ItemHeader selected={selectedDisplay} onSelect={handleSelect} meetings={allMeetings} />

        {/* 상세 내용 표시 (로딩 중이면 로딩 표시) */}
        {isDetailLoading && selectedRealId ? (
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl border-l bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out md:w-[600px]">
            <div className="flex h-full items-center justify-center">
              <p>상세 내용 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <ItemOpen selected={selectedDisplay} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}
