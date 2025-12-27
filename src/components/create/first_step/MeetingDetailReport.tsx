import { motion, AnimatePresence } from "framer-motion";
import { Meeting } from "@/mock/mockData";
import ReportHeader from "./report-detail/ReportHeader";
import ReportSummary from "./report-detail/ReportSummary";
import ReportFileList from "./report-detail/ReportFileList";

interface MeetingDetailReportProps {
  viewingMeeting: Meeting | null;
  setViewingMeeting: (meeting: Meeting | null) => void;
  selectedIds: Set<string>;
  toggleId: (id: string) => void;
}

const MeetingDetailReport = ({
  viewingMeeting,
  setViewingMeeting,
  selectedIds,
  toggleId,
}: MeetingDetailReportProps) => {
  return (
    <AnimatePresence>
      {viewingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingMeeting(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Modal Header */}
            <ReportHeader viewingMeeting={viewingMeeting} setViewingMeeting={setViewingMeeting} />

            {/* Modal Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {/* 1. Summary Section */}
              <ReportSummary
                selectedIds={selectedIds}
                toggleId={toggleId}
                viewingMeeting={viewingMeeting}
              />

              {/* 2. Files Section */}
              <ReportFileList
                selectedIds={selectedIds}
                toggleId={toggleId}
                viewingMeeting={viewingMeeting}
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 dark:bg-slate-950/50">
              Tip: 필요한 내용만 선택하여 AI를 효율적으로 학습시킬 수 있습니다.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MeetingDetailReport;
