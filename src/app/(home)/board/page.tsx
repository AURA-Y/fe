"use client";

import { useState } from "react";
import { PAST_MEETINGS, PastMeeting } from "@/mock/board/modkData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronRight, FileText, Paperclip, ArrowLeft } from "lucide-react";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value)
  );

export default function PastMeetingsBoardPage() {
  const [selected, setSelected] = useState<PastMeeting | null>(null);

  const handleSelect = (meeting: PastMeeting) => setSelected(meeting);
  const handleClose = () => setSelected(null);

  const outerScrollClass = selected ? "overflow-hidden" : "ghost-scroll-zero overflow-y-auto";

  return (
    <div
      className={`mx-auto w-full max-w-6xl space-y-4 px-4 pb-6 max-h-[calc(100vh-110px)] ${outerScrollClass}`}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">지난 회의록</h1>
        <p className="text-sm text-slate-500">목록에서 회의를 선택하면 전체 회의록을 볼 수 있습니다.</p>
      </div>

      {!selected && (
        <div className="rounded-2xl bg-white p-2 shadow-sm">
          <div className="px-2 pb-3">
            <h2 className="text-lg font-semibold">회의 목록</h2>
            <p className="text-sm text-slate-500">요약과 날짜를 미리 보고 선택하세요.</p>
          </div>
          <div className="space-y-3">
            {PAST_MEETINGS.map((meeting) => (
              <button
                key={meeting.id}
                onClick={() => handleSelect(meeting)}
                className="flex w-full flex-col gap-2 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-[0_4px_12px_-10px_rgba(0,0,0,0.25)] transition hover:border-blue-200 hover:bg-blue-50/50 focus:outline-none"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">{meeting.title}</div>
                    <div className="line-clamp-1 text-xs text-slate-600">{meeting.summary}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{formatDate(meeting.date)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="닫기"
            className="fixed right-6 top-20 z-30 h-10 w-10 rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

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
                <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
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
}
