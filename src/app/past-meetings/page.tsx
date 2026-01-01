"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { getReportsByIds } from "@/lib/api/api.reports";
import { Report } from "@/mock/board/types";
import Link from "next/link";

export default function PastMeetingsPage() {
  const user = useAuthStore((state) => state.user);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.roomReportIdxList || user.roomReportIdxList.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await getReportsByIds(user.roomReportIdxList);
        setReports(response.data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (loading) {
    return <div className="container mx-auto p-8">로딩 중...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-8">로그인이 필요합니다.</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-4xl font-bold">지난 회의</h1>

      {reports.length === 0 ? (
        <p className="text-gray-500">지난 회의가 없습니다.</p>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Link
              key={report.reportId}
              href={`/past-meetings/${report.reportId}`}
              className="block rounded-lg border p-6 transition-shadow hover:shadow-md"
            >
              <h2 className="text-2xl font-semibold">{report.topic}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {new Date(report.createdAt).toLocaleString("ko-KR")}
              </p>
              <p className="mt-4 line-clamp-2 text-gray-700">{report.summary}</p>
              <div className="mt-4 flex gap-2">
                {report.attendees.map((name, idx) => (
                  <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-sm">
                    {name}
                  </span>
                ))}
              </div>
              {report.uploadFileList.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  📎 {report.uploadFileList.length}개 파일
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
