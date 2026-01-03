"use client";

/**
 * [LiveKitView.tsx]
 * LiveKit 화상 회의의 메인 뷰 컴포넌트입니다.
 * Room 연결, 비디오 그리드(VideoGrid), 채팅(Chat), AI 검색 패널(AiSearchPanel),
 * 그리고 자동 음소거(AutoMuteOnSilence)와 같은 핵심 기능을 통합 관리합니다.
 */
import "@livekit/components-styles";
import "@livekit/components-styles";
import { env } from "@/env.mjs";
import { LiveKitRoom, LayoutContextProvider } from "@livekit/components-react";
import { roomOptions } from "@/lib/utils/room-options.utils";
import { RoomContent } from "@/components/livekitview/RoomContent";
import { AutoMuteOnSilence } from "@/components/livekitview/AutoMuteOnSilence";

// 적응형 스트림 비활성화 - 항상 최고 화질 수신
interface LiveKitViewProps {
  roomId: string;
  token: string;
  onDisconnected: () => void;
}


/**
 * [메인 컴포넌트: LiveKitView]
 * LiveKit의 LiveKitRoom 컨텍스트를 제공하는 최상위 래퍼입니다.
 * - 토큰(token)과 서버 URL(serverUrl)을 사용하여 Room에 연결합니다.
 * - 연결 상태에 따라 하위 컴포넌트(RoomContent, AutoMuteOnSilence 등)를 렌더링합니다.
 */
const LiveKitView = ({ roomId, token, onDisconnected }: LiveKitViewProps) => {
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
      <AutoMuteOnSilence />
      <LayoutContextProvider>
        <RoomContent roomId={roomId} onDisconnected={onDisconnected} />
      </LayoutContextProvider>
    </LiveKitRoom>
  );
};

export default LiveKitView;
