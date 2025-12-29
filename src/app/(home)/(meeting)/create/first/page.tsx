"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  getMeetingState,
  toggleMeetingSelection,
  toggleSingleSelection,
  calculateTotalSelectedCount,
} from "@/lib/utils";
import { Meeting, MOCK_MEETINGS } from "@/mock/mockData";
import CreateMeetingFirstStepBoard from "@/components/create/first_step/CreateMeetingFirstStepBoard";
import MeetingDetailReport from "@/components/create/first_step/MeetingDetailReport";
import { useRouter } from "next/navigation";

// --- Main Page Component ---

export default function CreateMeetingPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);
  const router = useRouter();
  // Group meetings by month
  const groupedMeetings = useMemo(() => {
    const groups: Record<string, Meeting[]> = {};
    MOCK_MEETINGS.forEach((meeting) => {
      const monthKey = format(meeting.date, "yyyy년 M월", { locale: ko });
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(meeting);
    });
    return groups;
  }, []);

  // Helper functions moved to @/lib/utils
  const getMeetingStateWrapper = (meeting: Meeting) => getMeetingState(meeting, selectedIds);

  const toggleMeetingAll = (meeting: Meeting) => {
    setSelectedIds(toggleMeetingSelection(meeting, selectedIds));
  };

  const toggleId = (id: string) => {
    setSelectedIds(toggleSingleSelection(id, selectedIds));
  };

  // Calculate total selected count for UI feedback
  const totalSelectedCount = calculateTotalSelectedCount(MOCK_MEETINGS, selectedIds);

  return (
    <>
      {/* 여기서 3개 case별로 다르게 출력 */}
      {/* Content Area */}
      <CreateMeetingFirstStepBoard
        groupedMeetings={groupedMeetings}
        getMeetingState={getMeetingStateWrapper}
        toggleMeetingAll={toggleMeetingAll}
        setViewingMeeting={setViewingMeeting}
        totalSelectedCount={totalSelectedCount}
        onClick={() => router.push("/create/second")}
      />
      {/* Details Modal */}
      <MeetingDetailReport
        viewingMeeting={viewingMeeting}
        setViewingMeeting={setViewingMeeting}
        selectedIds={selectedIds}
        toggleId={toggleId}
      />
    </>
  );
}
