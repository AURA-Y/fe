import { formatDate, errorHandler } from "@/lib/utils";
import { ReportDetails } from "@/lib/types/reports.type";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Paperclip, FileText, Trash2, XCircle } from "lucide-react";
import { getDownloadUrl } from "@/lib/api/api.s3-reports";
import { useAuthStore } from "@/lib/store/auth.store";
import { deleteReport } from "@/lib/api/api.reports";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface ItemOpenProps {
  selected: ReportDetails | null;
  onClose: () => void;
}

const ItemOpen = ({ selected, onClose }: ItemOpenProps) => {
  const { user, accessToken, setAuth } = useAuthStore();

  // 파일 다운로드 Mutation
  const downloadMutation = useMutation({
    mutationFn: async ({ fileUrl, fileName }: { fileUrl: string; fileName: string }) => {
      const downloadUrl = getDownloadUrl(fileUrl);

      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("다운로드 실패");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: unknown) => {
      errorHandler(error);
    },
    onSuccess: () => {
      console.log("파일 다운로드가 시작되었습니다.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await deleteReport(reportId);
    },
    onError: (error: unknown) => {
      errorHandler(error);
    },
    onSuccess: (_data, variables) => {
      if (user && accessToken) {
        const updatedList = (user.roomReportIdxList || []).filter((id) => id !== variables);
        setAuth({ ...user, roomReportIdxList: updatedList } as any, accessToken);
      }
      onClose();
    },
  });

  if (!selected) return null;

  const displayTitle = selected.topic;
  const displayDate = selected.createdAt;
  const displaySummary = selected.summary;
  const displayAttachments = selected.uploadFileList.map((file) => ({
    name: file.fileName,
    url: file.fileUrl,
  }));

  return (
    <div>
      {selected && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="닫기"
            className="fixed top-20 right-6 z-30 h-10 w-10 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* 회의 item opened container contents */}
          <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_10px_40px_-25px_rgba(0,0,0,0.35)]">
            <div className="scroll-invisible flex h-[calc(100vh-220px)] flex-col gap-6 overflow-y-auto p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{displayTitle}</h2>
                  {user?.roomReportIdxList?.includes(selected.reportId) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                      onClick={() => {
                        if (deleteMutation.isPending) return;
                        const ok = window.confirm("이 회의록을 삭제하시겠습니까?");
                        if (!ok) return;
                        deleteMutation.mutate(selected.reportId);
                      }}
                      disabled={deleteMutation.isPending}
                      aria-label="회의록 삭제"
                    >
                      {deleteMutation.isPending ? (
                        <Trash2 className="h-4 w-4 animate-pulse" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDate(displayDate)}</span>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">회의 주제 / 요약</h3>
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                  {displaySummary}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">참석자</h3>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                  {selected.attendees.join(", ")}
                </div>
              </section>

              <section className="space-y-3 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Paperclip className="h-4 w-4" />
                  <span>첨부파일</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {displayAttachments.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-[0_4px_10px_-12px_rgba(0,0,0,0.3)]"
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="truncate">{file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => {
                          downloadMutation.mutate({
                            fileUrl: file.url,
                            fileName: file.name,
                          });
                        }}
                        disabled={downloadMutation.isPending}
                      >
                        {downloadMutation.isPending ? "다운로드 중..." : "열기"}
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ItemOpen;
