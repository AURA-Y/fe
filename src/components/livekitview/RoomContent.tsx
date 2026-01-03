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

/**
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
    <>
      <div className="flex flex-1 overflow-hidden">
        <VideoGrid />
        <div
          className={`h-full w-[320px] border-l border-[#333] bg-[#0e0e0e] ${
            showChat ? "block" : "hidden"
          }`}
        >
          <div className="flex h-full flex-col" ref={sidebarRef}>
            <AiSearchPanel height={panelHeight} />
            <div
              className="h-2 cursor-row-resize bg-[#111] hover:bg-[#1a1a1a]"
              onMouseDown={() => {
                isDraggingRef.current = true;
                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";
              }}
              title="드래그하여 높이 조절"
            />
            <div className="min-h-0 flex-1">
              <Chat style={{ width: "100%", height: "100%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center [&_.lk-control-bar]:border-t-0">
        <div className="flex items-center">
          <ControlBar controls={{ chat: true, leave: false }} />
          <CustomLeaveButton roomId={roomId} onDisconnected={onDisconnected} />
        </div>
      </div>
      <RoomAudioRenderer />
    </>
  );
};
