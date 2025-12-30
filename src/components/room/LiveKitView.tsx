import "@livekit/components-styles";
import { env } from "@/env.mjs";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  Chat,
  LayoutContextProvider,
  useLayoutContext,
} from "@livekit/components-react";
import { VideoGrid } from "./VideoGrid";

interface LiveKitViewProps {
  token: string;
  onDisconnected: () => void;
}

const RoomContent = () => {
  const layoutContext = useLayoutContext();
  const showChat = layoutContext?.widget.state?.showChat;

  return (
    <>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <VideoGrid />
        {showChat && (
          <div
            style={{
              width: "320px",
              height: "100%",
              borderLeft: "1px solid #333",
              backgroundColor: "#0e0e0e",
            }}
          >
            <Chat style={{ width: "100%", height: "100%" }} />
          </div>
        )}
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
