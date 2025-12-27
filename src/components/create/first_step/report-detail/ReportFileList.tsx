import { cn } from "@/lib/utils";
import { Paperclip } from "lucide-react";
import MeetingReportCheckBox from "../MeetingReportCheckBox";
import FileListContainer from "./FileListContainer";
import FileEmptyContainer from "./FileEmptyContainer";

interface ReportFileListProps {
  selectedIds: Set<string>;
  toggleId: (id: string) => void;
  viewingMeeting: {
    id: string;
    files: {
      id: string;
      name: string;
      size: string;
    }[];
  };
}

export default function ReportFileList({
  selectedIds,
  toggleId,
  viewingMeeting,
}: ReportFileListProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <Paperclip className="h-4 w-4" />
        첨부 파일 ({viewingMeeting.files.length})
      </div>

      {viewingMeeting.files.length > 0 ? (
        <div className="ml-7 grid gap-3">
          {viewingMeeting.files.map((file) => {
            const isFileSelected = selectedIds.has(`${viewingMeeting.id}-file-${file.id}`);
            return (
              <FileListContainer
                key={file.id}
                file={file}
                toggleId={toggleId}
                viewingMeeting={viewingMeeting}
                isFileSelected={isFileSelected}
              />
            );
          })}
        </div>
      ) : (
        <FileEmptyContainer />
      )}
    </div>
  );
}
