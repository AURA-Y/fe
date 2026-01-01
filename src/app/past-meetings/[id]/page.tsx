"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getReportById } from "@/lib/api/api.reports";
import { Report } from "@/mock/board/types";

export default function ReportDetailPage() {
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getReportById(params.id as string);
        setReport(response.data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  if (loading) return <div className="container mx-auto p-8">로딩 중...</div>;
  if (!report) return <div className="container mx-auto p-8">회의록을 찾을 수 없습니다.</div>;

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{report.topic}</h1>
        <p className="mt-2 text-gray-500">{new Date(report.createdAt).toLocaleString("ko-KR")}</p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">요약</h2>
        <p className="text-gray-700">{report.summary}</p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">참석자</h2>
        <div className="flex flex-wrap gap-2">
          {report.attendees.map((name, idx) => (
            <span key={idx} className="rounded-full bg-blue-100 px-4 py-2">{name}</span>
          ))}
        </div>
      </div>

      {report.uploadFileList.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-2xl font-semibold">첨부 파일</h2>
          <div className="space-y-4">
            {report.uploadFileList.map((file) => (
              <div key={file.fileId} className="flex items-center justify-between rounded-lg border bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {file.fileType.includes("image") ? "🖼️" :
                     file.fileType.includes("presentation") ? "📊" : "📄"}
                  </div>
                  <div>
                    <p className="font-medium">{file.fileName}</p>
                    <p className="text-sm text-gray-500">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  다운로드
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
