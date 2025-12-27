import { cn } from "@/lib/utils";
import MeetingReportCheckBox from "../MeetingReportCheckBox";

interface FileListContainerProps {
  file: {
    id: string;
    name: string;
    size: string;
  };
  toggleId: (id: string) => void;
  viewingMeeting: {
    id: string;
    files: {
      id: string;
      name: string;
      size: string;
    }[];
  };
  isFileSelected: boolean;
}

const FileListContainer = ({
  file,
  toggleId,
  viewingMeeting,
  isFileSelected,
}: FileListContainerProps) => {
  return (
    <div
      key={file.id}
      onClick={() => toggleId(`${viewingMeeting.id}-file-${file.id}`)}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
        isFileSelected
          ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20"
          : "border-slate-200 dark:border-slate-700"
      )}
    >
      <div className="flex items-center gap-3">
        <MeetingReportCheckBox
          checked={isFileSelected}
          onChange={() => {}} // handled by parent div click
        />
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              isFileSelected
                ? "text-blue-700 dark:text-blue-300"
                : "text-slate-700 dark:text-slate-300"
            )}
          >
            {file.name}
          </p>
          <p className="text-xs text-slate-400">{file.size}</p>
        </div>
      </div>
    </div>
  );
};

export default FileListContainer;
