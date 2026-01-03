"use client";

import { useEffect, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";

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
      className="overflow-y-auto border-b border-[#222] p-4 text-sm text-slate-200"
      style={{ height }}
    >
      <p className="mb-2 text-xs font-semibold text-slate-400">AI 검색 결과</p>
      {messages.length === 0 ? (
        <p className="text-xs text-slate-400">AI 검색 결과가 여기에 표시됩니다.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="rounded-md bg-[#151515] p-3">
              <p className="text-sm whitespace-pre-wrap text-slate-100">{msg.text}</p>
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
