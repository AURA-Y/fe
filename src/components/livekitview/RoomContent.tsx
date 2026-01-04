"use client";

import { useEffect, useRef, useState } from "react";
import {
  ControlBar,
  Chat,
  useLayoutContext,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { VideoGrid } from "../room/VideoGrid";
import { AiSearchPanel } from "./AiSearchPanel";
import { CustomLeaveButton } from "./CustomLeaveButton";
import { cn } from "@/lib/utils";

/**
 * 참여자 화면 및 상태 표시 (비디오 그리드)
 * [컴포넌트: RoomContent]
 * 회의실의 실제 화면 레이아웃을 구성합니다.
 * - 좌측/중앙: 참여자들의 비디오 그리드 (VideoGrid)
 * - 우측: 채팅 및 AI 패널 사이드바 (크기 조절 가능)
 * - 하단: 컨트롤 바 (마이크/카메라 제어) 및 나가기 버튼
 */
export const RoomContent = ({
  roomId,
  onDisconnected,
}: {
  roomId: string;
  onDisconnected: () => void;
}) => {
  const layoutContext = useLayoutContext();
  const showChat = layoutContext?.widget.state?.showChat;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [panelHeight, setPanelHeight] = useState(160);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !sidebarRef.current) return;
      const rect = sidebarRef.current.getBoundingClientRect();
      const minHeight = 80;
      const maxHeight = Math.max(120, rect.height - 160);
      const nextHeight = Math.min(maxHeight, Math.max(minHeight, e.clientY - rect.top));
      setPanelHeight(nextHeight);
    };

    const handleUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 text-white selection:bg-cyan-200/40">
      {/* Background overlay for depth */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="flex flex-1 overflow-hidden">
        <VideoGrid />
        <div
          className={cn(
            "h-full w-[320px] border-l border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-in-out z-20",
            showChat ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute right-0"
          )}
        >
          <div className="flex h-full flex-col backdrop-brightness-110" ref={sidebarRef}>
            <AiSearchPanel height={panelHeight} />
            <div
              className="h-1.5 w-full cursor-row-resize bg-white/10 hover:bg-white/30 transition-colors"
              onMouseDown={() => {
                isDraggingRef.current = true;
                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";
              }}
              title="드래그하여 높이 조절"
            />
            <div className="min-h-0 flex-1 relative group p-4">
              {/* Custom Styling Wrapper for LiveKit Chat */}
              <div
                className={cn(
                  "h-full w-full rounded-[24px] overflow-hidden",
                  // --- 1. General Layout & Backgrounds ---
                  "[&_.lk-chat]:bg-transparent [&_.lk-chat]:h-full",
                  "[&_.lk-chat-header]:hidden", // Hide default header if present
                  "[&_.lk-list]:bg-transparent [&_.lk-list]:p-4 [&_.lk-list]:scrollbar-thin [&_.lk-list]:scrollbar-thumb-cyan-500/20 [&_.lk-list]:scrollbar-track-transparent",

                  // --- 2. Message Bubbles (The "Liquid Glass" Cards) ---
                  "[&_.lk-chat-entry]:bg-transparent [&_.lk-chat-entry]:mb-4 drop-shadow-sm",
                  "[&_.lk-chat-entry-message]:bg-white/10 [&_.lk-chat-entry-message]:backdrop-blur-xl",
                  "[&_.lk-chat-entry-message]:border [&_.lk-chat-entry-message]:border-white/20",
                  "[&_.lk-chat-entry-message]:rounded-[20px] [&_.lk-chat-entry-message]:rounded-tl-none",
                  "[&_.lk-chat-entry-message]:px-5 [&_.lk-chat-entry-message]:py-3.5",
                  "[&_.lk-chat-entry-message]:text-[13px] [&_.lk-chat-entry-message]:leading-relaxed [&_.lk-chat-entry-message]:text-blue-50",
                  "[&_.lk-chat-entry-message]:text-left [&_.lk-chat-entry-message]:shadow-lg [&_.lk-chat-entry-message]:shadow-cyan-900/10",
                  
                  // Hover effect on messages
                  "[&_.lk-chat-entry:hover_.lk-chat-entry-message]:bg-white/20 [&_.lk-chat-entry:hover_.lk-chat-entry-message]:border-white/30 [&_.lk-chat-entry:hover_.lk-chat-entry-message]:shadow-cyan-500/20",

                  // --- 3. Metadata (Name & Time) ---
                  "[&_.lk-chat-entry-metadata]:flex [&_.lk-chat-entry-metadata]:items-baseline [&_.lk-chat-entry-metadata]:gap-2 [&_.lk-chat-entry-metadata]:mb-2 [&_.lk-chat-entry-metadata]:pl-2",
                  "[&_.lk-chat-entry-metadata]:text-xs [&_.lk-chat-entry-metadata]:font-medium",
                  "[&_.lk-participant-name]:text-cyan-200 [&_.lk-participant-name]:ml-1",
                  "[&_.lk-timestamp]:text-[10px] [&_.lk-timestamp]:text-blue-200/60",

                  // --- 4. Input Area (Floating Glass Bar) ---
                  "[&_.lk-chat-form]:m-1 [&_.lk-chat-form]:mt-2",
                  "[&_.lk-chat-form]:rounded-full [&_.lk-chat-form]:bg-white/10 [&_.lk-chat-form]:backdrop-blur-2xl",
                  "[&_.lk-chat-form]:border [&_.lk-chat-form]:border-white/20",
                  "[&_.lk-chat-form]:p-2 [&_.lk-chat-form]:shadow-lg [&_.lk-chat-form]:shadow-black/5",
                  "[&_.lk-chat-form:focus-within]:bg-white/20 [&_.lk-chat-form:focus-within]:border-cyan-300/40 [&_.lk-chat-form:focus-within]:ring-2 [&_.lk-chat-form:focus-within]:ring-cyan-300/20",

                  // --- 5. Input Field ---
                  "[&_.lk-form-control]:bg-transparent [&_.lk-form-control]:border-none",
                  "[&_.lk-form-control]:text-[13px] [&_.lk-form-control]:text-white [&_.lk-form-control]:placeholder-blue-100/50",
                  "[&_.lk-form-control]:px-4 [&_.lk-form-control]:py-2",
                  "[&_.lk-form-control]:focus:ring-0",

                  // --- 6. Send Button ---
                  "[&_.lk-chat-form-button]:h-10 [&_.lk-chat-form-button]:w-10",
                  "[&_.lk-chat-form-button]:rounded-full [&_.lk-chat-form-button]:bg-gradient-to-tr [&_.lk-chat-form-button]:from-cyan-500 [&_.lk-chat-form-button]:to-blue-500",
                  "[&_.lk-chat-form-button]:flex [&_.lk-chat-form-button]:items-center [&_.lk-chat-form-button]:justify-center",
                  "[&_.lk-chat-form-button]:text-white [&_.lk-chat-form-button]:shadow-lg [&_.lk-chat-form-button]:shadow-cyan-500/30",
                  "[&_.lk-chat-form-button]:transition-all [&_.lk-chat-form-button]:duration-300",
                  "[&_.lk-chat-form-button:hover]:scale-110 [&_.lk-chat-form-button:hover]:shadow-cyan-400/50",
                  "[&_.lk-chat-form-button:disabled]:opacity-0 [&_.lk-chat-form-button:disabled]:w-0 [&_.lk-chat-form-button:disabled]:p-0"
                )}
              >
                <Chat style={{ background : "transparent",width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-6 pt-2 z-10">
        <div className="flex items-center gap-4 rounded-full bg-white/10 px-6 py-3 backdrop-blur-2xl border border-white/20 shadow-2xl hover:bg-white/20 transition-all shadow-cyan-500/10 ring-1 ring-white/10">
          <ControlBar
            controls={{ chat: true, leave: false }}
            className="[&_.lk-button]:!bg-white/10 [&_.lk-button]:!border-white/10 [&_.lk-button]:!text-white [&_.lk-button:hover]:!bg-white/20"
          />
          <CustomLeaveButton roomId={roomId} onDisconnected={onDisconnected} />
        </div>
      </div>
      <RoomAudioRenderer />
    </div>
  );
};
