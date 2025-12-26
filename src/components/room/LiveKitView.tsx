import "@livekit/components-styles";
import { env } from "@/env.mjs";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";

interface LiveKitViewProps {
  token: string;
  onDisconnected: () => void;
  // 사용자가 나가기 버튼을 누를 시, 이벤트 핸들러
}

const LiveKitView = ({ token, onDisconnected }: LiveKitViewProps) => {
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={env.NEXT_PUBLIC_LIVEKIT_URL}
      onDisconnected={onDisconnected}
      onError={(e) => console.error(e)} // 회의 중 오류가 발생 시, 이벤트 핸들러
      //data-lk-theme, style 등은 LiveKitRoom의 동작·테마·UI 스타일을 설정
      data-lk-theme="default"
      style={{ height: "100vh" }}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};

export default LiveKitView;
