import "@livekit/components-styles";
import { useEffect, useRef, useState } from "react";
import { env } from "@/env.mjs";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  Chat,
  LayoutContextProvider,
  useLayoutContext,
  useRoomContext,
} from "@livekit/components-react";
import { VideoPresets, RoomEvent, RoomOptions } from "livekit-client";
import { VideoGrid } from "./VideoGrid";

// VP9 최고 화질 설정
const roomOptions: RoomOptions = {
  videoCaptureDefaults: {
    resolution: VideoPresets.h1080.resolution,
    facingMode: "user",
    frameRate: 30,
  },
  publishDefaults: {
    videoCodec: "vp9",
    // 시뮬캐스트 비활성화 - 항상 최고 화질 전송
    simulcast: false,
    // VP9 최고 화질 비트레이트 설정 (최대 5Mbps)
    videoEncoding: {
      maxBitrate: 5_000_000,
      maxFramerate: 30,
      priority: "high",
    },
    // VP9 SVC (Scalable Video Coding) - 더 효율적인 고화질
    scalabilityMode: "L1T3",
    // 화질 저하 방지
    degradationPreference: "maintain-resolution",
  },
  // 적응형 스트림 비활성화 - 항상 최고 화질 수신
  adaptiveStream: false,
  dynacast: false,
};

interface LiveKitViewProps {
  token: string;
  onDisconnected: () => void;
}

interface AiMessage {
  id: string;
  text: string;
  minutes: { source: string; snippet: string }[];
}

const AiSearchPanel = ({ height }: { height: number }) => {
  const room = useRoomContext();
  const [messages, setMessages] = useState<AiMessage[]>([]);

  useEffect(() => {
    if (!room) return;

    const onData = (payload: Uint8Array) => {
      let parsed: any = null;
      try {
        const text = new TextDecoder().decode(payload);
        parsed = JSON.parse(text);
      } catch {
        return;
      }

      if (parsed?.type !== "search_answer" || !parsed?.text) return;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + Math.random(),
          text: parsed.text,
          minutes: Array.isArray(parsed.minutes) ? parsed.minutes : [],
        },
      ]);
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room]);

  return (
    <div
      className="border-b border-[#222] p-4 text-sm text-slate-200 overflow-y-auto"
      style={{ height }}
    >
      <p className="mb-2 text-xs font-semibold text-slate-400">AI 검색 결과</p>
      {messages.length === 0 ? (
        <p className="text-xs text-slate-400">AI 검색 결과가 여기에 표시됩니다.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-md bg-[#151515] p-3">
              <p className="whitespace-pre-wrap text-sm text-slate-100">{msg.text}</p>
              {msg.minutes.length > 0 && (
                <div className="mt-2 text-xs text-slate-400">
                  {msg.minutes.map((m) => (
                    <p key={`${msg.id}-${m.source}`}>
                      [{m.source}] {m.snippet}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RoomContent = () => {
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
      <ControlBar controls={{ chat: true }} />
      <RoomAudioRenderer />
    </>
  );
};

const LiveKitView = ({ token, onDisconnected }: LiveKitViewProps) => {
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={env.NEXT_PUBLIC_LIVEKIT_URL}
      options={roomOptions}
      onDisconnected={onDisconnected}
      onError={(e) => console.error(e)}
      data-lk-theme="default"
      style={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <LayoutContextProvider>
        <RoomContent />
      </LayoutContextProvider>
    </LiveKitRoom>
  );
};

export default LiveKitView;
