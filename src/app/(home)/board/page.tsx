"use client";

import { useState } from "react";
import { PAST_MEETINGS, PastMeeting } from "@/mock/board/modkData";
import ItemHeader from "@/components/board/ItemHeader";
import ItemOpen from "@/components/board/ItemOpen";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );

export default function PastMeetingsBoardPage() {
  const [selected, setSelected] = useState<PastMeeting | null>(null);

  const handleSelect = (meeting: PastMeeting) => setSelected(meeting);
  const handleClose = () => setSelected(null);

  const outerScrollClass = selected ? "overflow-hidden" : "ghost-scroll-zero overflow-y-auto";

  return (
    <div
      className={`mx-auto max-h-[calc(100vh-110px)] w-full max-w-6xl space-y-4 px-4 pb-6 ${outerScrollClass}`}
    >
      {/* 회의 item header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">지난 회의록</h1>
        <p className="text-sm text-slate-500">
          목록에서 회의를 선택하면 전체 회의록을 볼 수 있습니다.
        </p>
      </div>

      {/* 회의 item closed container */}
      <ItemHeader selected={selected} onSelect={handleSelect} />

      {/* 회의 item opened container */}
      <ItemOpen selected={selected} onClose={handleClose} />
    </div>
  );
}
