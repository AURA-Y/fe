import { FileText } from "lucide-react";
import MeetingReportCheckBox from "../MeetingReportCheckBox";
import { cn } from "@/lib/utils";

interface ReportSummaryProps {
  selectedIds: Set<string>;
  toggleId: (id: string) => void;
  viewingMeeting: {
    id: string;
    summary: string;
  };
}

const ReportSummary = ({ selectedIds, toggleId, viewingMeeting }: ReportSummaryProps) => {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <MeetingReportCheckBox
          checked={selectedIds.has(`${viewingMeeting.id}-summary`)}
          onChange={() => toggleId(`${viewingMeeting.id}-summary`)}
        />
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <FileText className="h-4 w-4" />
          회의 요약
        </div>
      </div>
      <div
        className={cn(
          "ml-7 rounded-lg border p-4 text-sm leading-relaxed transition-colors",
          selectedIds.has(`${viewingMeeting.id}-summary`)
            ? "border-blue-200 bg-blue-50/50 text-slate-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-slate-200"
            : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
        )}
      >
        {viewingMeeting.summary}
      </div>
    </div>
  );
};

export default ReportSummary;
