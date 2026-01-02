import { formatDate } from "@/lib/utils";
import { PastMeeting } from "@/mock/board/mockData";
import { ReportMetadata } from "@/lib/types/reports.type";
import { CalendarDays, ChevronRight } from "lucide-react";

type Meeting = PastMeeting | ReportMetadata;

interface ItemHeaderProps {
  selected: Meeting | null;
  onSelect: (meeting: Meeting) => void;
  meetings: Meeting[];
}

const ItemHeader = ({ selected, onSelect, meetings }: ItemHeaderProps) => {
  return (
    <div>
      {!selected && (
        <div className="rounded-2xl bg-white p-2 shadow-sm">
          <div className="px-2 pb-3">
            <h2 className="text-lg font-semibold">회의 목록</h2>
            <p className="text-sm text-slate-500">요약과 날짜를 미리 보고 선택하세요.</p>
          </div>
          <div className="space-y-3">
            {meetings.map((meeting) => {
              // PastMeeting과 ReportMetadata 구분
              const isPastMeeting = "title" in meeting;
              const displayTitle = isPastMeeting ? meeting.title : meeting.topic;
              const displayDate = isPastMeeting ? meeting.date : meeting.createdAt;
              const displayId = isPastMeeting ? meeting.id : meeting.reportId;
              const displaySummary = isPastMeeting
                ? meeting.summary
                : `참석자: ${meeting.attendees.join(", ")}`;

              return (
                <button
                  key={displayId}
                  onClick={() => onSelect(meeting)}
                  className="flex w-full flex-col gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-[0_4px_12px_-10px_rgba(0,0,0,0.25)] transition hover:border-blue-200 hover:bg-blue-50/50 focus:outline-none"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-900">{displayTitle}</div>
                      <div className="line-clamp-1 text-xs text-slate-600">{displaySummary}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{formatDate(displayDate)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemHeader;
