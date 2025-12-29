import { formatDate } from "@/lib/utils";
import { PAST_MEETINGS, PastMeeting } from "@/mock/board/modkData";
import { CalendarDays, ChevronRight } from "lucide-react";

interface ItemHeaderProps {
  selected: PastMeeting | null;
  onSelect: (meeting: PastMeeting) => void;
}

const ItemHeader = ({ selected, onSelect }: ItemHeaderProps) => {
  return (
    <div>
      {!selected && (
        <div className="rounded-2xl bg-white p-2 shadow-sm">
          <div className="px-2 pb-3">
            <h2 className="text-lg font-semibold">회의 목록</h2>
            <p className="text-sm text-slate-500">요약과 날짜를 미리 보고 선택하세요.</p>
          </div>
          <div className="space-y-3">
            {PAST_MEETINGS.map((meeting) => (
              <button
                key={meeting.id}
                onClick={() => onSelect(meeting)}
                className="flex w-full flex-col gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-[0_4px_12px_-10px_rgba(0,0,0,0.25)] transition hover:border-blue-200 hover:bg-blue-50/50 focus:outline-none"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">{meeting.title}</div>
                    <div className="line-clamp-1 text-xs text-slate-600">{meeting.summary}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{formatDate(meeting.date)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemHeader;
