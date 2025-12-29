import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X } from "lucide-react";

interface ReportHeaderProps {
  viewingMeeting: {
    title: string;
    date: Date;
    duration: string;
  };
  setViewingMeeting: (meeting: any) => void;
}

const ReportHeader = ({ viewingMeeting, setViewingMeeting }: ReportHeaderProps) => {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 p-6 dark:border-slate-800">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{viewingMeeting.title}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {format(viewingMeeting.date, "yyyy년 M월 d일 HH:mm", { locale: ko })} ·{" "}
          {viewingMeeting.duration}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setViewingMeeting(null)}>
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ReportHeader;
