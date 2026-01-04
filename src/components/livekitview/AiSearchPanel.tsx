"use client";

import { useEffect, useState, useRef } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AiMessage {
  id: string;
  text: string;
  minutes: { source: string; snippet: string }[];
}

/**
 * [컴포넌트: AiSearchPanel]
 * 실시간 AI 검색 결과를 표시하는 패널입니다.
 * - LiveKit의 DataChannel(RoomEvent.DataReceived)을 통해 백엔드나 미디어 서버로부터
 *   'search_answer' 타입의 메시지를 수신하여 화면에 렌더링합니다.
 */
export const AiSearchPanel = ({ height }: { height: number }) => {
  const room = useRoomContext();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
        "border-b border-white/10 bg-white/5 backdrop-blur-md"
      )}
      style={{ height }}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
          <span className="text-sm">✨</span>
        </div>
        <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-100 uppercase tracking-widest drop-shadow-sm">
          AI Insight
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-8 text-center opacity-50">
          <div className="mb-2 text-2xl">🔮</div>
          <p className="text-xs font-medium text-slate-300">AI 검색 결과가 이곳에 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "group relative overflow-hidden rounded-[24px] border border-white/20 bg-white/10 p-5 shadow-lg transition-all",
                  "hover:bg-white/20 hover:shadow-cyan-500/20 hover:border-cyan-200/30 hover:-translate-y-0.5"
                )}
              >
                {/* Glow effect */}
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl transition-all group-hover:bg-cyan-400/30" />
                
                <p className="relative z-10 text-[13px] leading-relaxed text-blue-50 whitespace-pre-wrap font-medium">
                  {msg.text}
                </p>
                
                {msg.minutes.length > 0 && (
                  <div className="relative z-10 mt-3 space-y-2 border-t border-white/5 pt-3">
                    {msg.minutes.map((m, idx) => (
                      <div 
                        key={`${msg.id}-${idx}`}
                        className="flex gap-2 rounded-xl bg-blue-900/30 p-2.5 text-xs text-blue-100/80 transition-colors hover:bg-blue-900/50 border border-white/5"
                      >
                        <span className="shrink-0 font-bold text-cyan-300">[{m.source}]</span>
                        <span className="line-clamp-2 text-white/70">{m.snippet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
