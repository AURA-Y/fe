"use client";

import { useState, useEffect } from "react";
import { PAST_MEETINGS, PastMeeting } from "@/mock/board/modkData";
import { useAuthStore } from "@/lib/store/auth.store";
import { getReportsByIds } from "@/lib/api/api.reports";
import { ReportMetadata, ReportDetails } from "@/mock/board/types";
import { fetchReportDetailsFromS3 } from "@/lib/api/api.s3-reports";
import ItemHeader from "@/components/board/ItemHeader";
import ItemOpen from "@/components/board/ItemOpen";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );

export default function PastMeetingsBoardPage() {
  const user = useAuthStore((state) => state.user);
  const [reportMetadata, setReportMetadata] = useState<ReportMetadata[]>([]);
  const [selected, setSelected] = useState<PastMeeting | ReportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingDetails, setFetchingDetails] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      console.log("🔍 User object:", user);
      console.log("📋 roomReportIdxList:", user?.roomReportIdxList);

      if (!user?.roomReportIdxList || user.roomReportIdxList.length === 0) {
        console.log("❌ No roomReportIdxList found");
        setLoading(false);
        return;
      }

      console.log("✅ Fetching reports for IDs:", user.roomReportIdxList);

      try {
        const response = await getReportsByIds(user.roomReportIdxList);
        console.log("✅ Reports fetched:", response.data);
        setReportMetadata(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const handleSelect = async (meeting: PastMeeting | ReportMetadata) => {
    // PastMeeting인 경우 바로 선택
    if ('title' in meeting) {
      setSelected(meeting);
      return;
    }

    // ReportMetadata인 경우 S3에서 상세 정보 가져오기
    setFetchingDetails(true);
    try {
      const details = await fetchReportDetailsFromS3(meeting.reportId);
      setSelected(details);
    } catch (error) {
      console.error("Failed to fetch report details from S3:", error);
      alert("회의록 상세 정보를 불러오는데 실패했습니다.");
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleClose = () => setSelected(null);

  const outerScrollClass = selected ? "overflow-hidden" : "ghost-scroll-zero overflow-y-auto";

  const allMeetings = [...reportMetadata, ...PAST_MEETINGS];

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <p className="text-slate-900 dark:text-slate-100">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">지난 회의록</h1>
          <p className="text-sm text-slate-500">
            목록에서 회의를 선택하면 전체 회의록을 볼 수 있습니다.
            ({allMeetings.length}개 회의)
          </p>
        </div>

        <ItemHeader selected={selected} onSelect={handleSelect} meetings={allMeetings} />
        <ItemOpen selected={selected} onClose={handleClose} />
      </div>
    </div>
  );
}
