import { cn } from "@/lib/utils";
import { Meeting } from "@/mock/mockData";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import MeetingReportCheckBox from "./MeetingReportCheckBox";

interface SingleMeetingProps {
  meeting: Meeting;
  isAll: boolean;
  isPartial: boolean;
  toggleMeetingAll: (meeting: Meeting) => void;
  setViewingMeeting: (meeting: Meeting) => void;
}

const SingleMeeting = ({
  meeting,
  isAll,
  isPartial,
  toggleMeetingAll,
  setViewingMeeting,
}: SingleMeetingProps) => {
  return (
    <motion.div
      key={meeting.id}
      layoutId={`card-${meeting.id}`}
      onClick={() => setViewingMeeting(meeting)}
      className={cn(
        "group relative flex cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-700",
        (isAll || isPartial) &&
          "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10"
      )}
    >
      {/* Checkbox Area */}
      <div
        className="flex h-full items-center p-2"
        onClick={(e) => {
          e.stopPropagation(); // Prevent modal opening
        }}
      >
        <MeetingReportCheckBox
          checked={isAll}
          partial={isPartial}
          onChange={() => toggleMeetingAll(meeting)}
        />
      </div>

      {/* Info Area */}
      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{meeting.title}</h4>
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(meeting.date, "M월 d일 (eee)", { locale: ko })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(meeting.date, "HH:mm")} ({meeting.duration})
          </span>
        </div>
      </div>

      <div className="text-slate-300 transition-transform group-hover:translate-x-1 dark:text-slate-600">
        <ChevronRight className="h-5 w-5" />
      </div>
    </motion.div>
  );
};

export default SingleMeeting;
