import { formatDate } from "@/lib/utils";
import { PastMeeting } from "@/mock/board/modkData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Paperclip, FileText } from "lucide-react";
interface ItemOpenProps {
  selected: PastMeeting | null;
  onClose: () => void;
}

const ItemOpen = ({ selected, onClose }: ItemOpenProps) => {
  if (!selected) return null;
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
                  <h2 className="text-2xl font-bold">{selected.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays className="h-4 w-4" />
                  <span>{formatDate(selected.date)}</span>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">회의 주제 / 요약</h3>
                <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
                  {selected.summary}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">전체 회의록</h3>
                <pre className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
                  {selected.minutes}
                </pre>
              </section>

              <section className="space-y-3 pb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Paperclip className="h-4 w-4" />
                  <span>첨부파일</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selected.attachments.map((file) => (
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
                        asChild
                      >
                        <a href="#" onClick={(e) => e.preventDefault()}>
                          열기
                        </a>
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
