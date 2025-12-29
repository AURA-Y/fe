"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { VideoGrid } from "@/components/room/VideoGrid";
import { ControlBar } from "@/components/room/ControlBar";
import { ChatSidebar } from "@/components/room/ChatSidebar";
import { ScreenSharePicker } from "@/components/room/ScreenSharePicker";
import { useNoiseGate } from "@/hooks/use-noise-gate";
import { useMediasoup } from "@/hooks/use-mediasoup";

export default function RoomPage() {
  const params = useParams(); // { roomId: string }
  const roomId = params.roomId as string;

  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // 로컬 상태 (실제 연동 시에는 서버/Mediasoup 상태로 대체)
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScreenPickerOpen, setIsScreenPickerOpen] = useState(false);

  // [NEW] Local Media Stream State
  const [sourceStream, setSourceStream] = useState<MediaStream | null>(null);

  // Apply Noise Gate to the source stream
  const { stream: gatedStream, isSpeaking } = useNoiseGate(sourceStream, 0.05);

  // Mediasoup Hook
  const { status, error, peers } = useMediasoup({
    roomId,
    nickname: user?.nickname || "Guest",
    signallingUrl:
      process.env.NEXT_PUBLIC_SIGNALLING_URL ||
      "http://aura-server-alb-2065673986.ap-northeast-2.elb.amazonaws.com",
    localStream: gatedStream,
  });

  // Initialize Local Media (Camera/Mic)
  const initLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: { ideal: true },
          noiseSuppression: { ideal: true },
          autoGainControl: false, // Turn off AGC to prevent boosting background noise
        },
      });
      setSourceStream(stream);
      setIsCamOn(true);
      setIsMicOn(true);
    } catch (err) {
      console.error("Failed to get local media", err);
      setIsCamOn(false);
      setIsMicOn(false);
    }
  };

  // Ensure client-side rendering
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initLocalMedia();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      setSourceStream((prevStream) => {
        if (prevStream) {
          prevStream.getTracks().forEach((track) => track.stop());
        }
        return null;
      });
    };
  }, []);

  // Control visibility logic
  const [showControls, setShowControls] = useState(true);
  const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Only set timeout if no menu is open
    if (!isAnyMenuOpen) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!isAnyMenuOpen) setShowControls(false);
      }, 3000);
    }
  };

  // Update timeout when menu state changes
  useEffect(() => {
    if (isAnyMenuOpen) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      setShowControls(true);
    } else {
      handleMouseMove();
    }
  }, [isAnyMenuOpen]);

  const handleScreenShareClick = () => {
    if (isScreenSharing) {
      // Stop Screen Share (Revert to Camera)
      stopScreenShare();
    } else {
      // Open Picker (or toggle directly for simple testing)
      setIsScreenPickerOpen(true);
    }
  };

  const handleStartShare = async (sourceId?: string) => {
    // Note: sourceId from custom picker often requires Electron or browser extension.
    // For standard Web API, we just call getDisplayMedia().
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // System audio optional
      });

      setSourceStream(screenStream);
      setIsScreenSharing(true);
      setIsScreenPickerOpen(false);

      // Handle stream end (user clicks "Stop sharing" native browser UI)
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Failed to share screen", err);
    }
  };

  const stopScreenShare = async () => {
    // Revert to Camera
    await initLocalMedia();
    setIsScreenSharing(false);
  };

  const handleLeaveRoom = () => {
    if (confirm("회의를 종료하시겠습니까?")) {
      router.push("/");
    }
  };

  // Volume States
  const [inputVolume, setInputVolume] = useState(100);
  const [outputVolume, setOutputVolume] = useState(100);

  // Device Change Handler
  const handleDeviceChange = async (kind: MediaDeviceKind, deviceId: string) => {
    console.log(`Switching ${kind} to ${deviceId}`);
    // Real implementation requires stopping current stream and getUserMedia with { deviceId: { exact: deviceId } }
    // For now, just re-init media to test flow, or we can implement the full switch logic.
    if (kind === "audioinput" || kind === "videoinput") {
      // Stop current tracks
      if (sourceStream) {
        sourceStream.getTracks().forEach((t) => t.stop());
      }
      // Re-acquire with specific device
      try {
        const constraints: MediaStreamConstraints = {
          audio: kind === "audioinput" ? { deviceId: { exact: deviceId } } : true,
          video: kind === "videoinput" ? { deviceId: { exact: deviceId } } : true,
        };
        if (kind === "audioinput") {
          // Preserve video track if we only change audio?
          // Simplest is to just re-get huge stream for now or smart replace.
          // Let's stick to simple re-init for prototype
          constraints.video = true;
          constraints.audio = { deviceId: { exact: deviceId } };
        } else {
          constraints.video = { deviceId: { exact: deviceId } };
          constraints.audio = true;
        }

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setSourceStream(newStream);
      } catch (e) {
        console.error("Failed to switch device", e);
      }
    }
  };

  if (!roomId || !isMounted) return null;

  return (
    <div
      className="relative flex h-screen w-full flex-col overflow-hidden bg-[#0a0b10] text-white"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !isAnyMenuOpen && setShowControls(false)}
    >
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <VideoGrid
          // participants={participants} // REMOVE
          remotePeers={peers} // USE REAL DATA
          isMicOn={isMicOn}
          isScreenSharing={isScreenSharing}
          userNickname={user?.nickname}
          localStream={gatedStream} // Pass the processed stream
          localIsSpeaking={isSpeaking}
        />
        <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>

      {/* Control Bar */}
      <ControlBar
        isVisible={showControls}
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        participantCount={1 + peers.size}
        onMicToggle={() => {
          const newState = !isMicOn;
          setIsMicOn(newState);
          if (sourceStream) {
            sourceStream.getAudioTracks().forEach((track) => (track.enabled = newState));
          }
        }}
        onCamToggle={() => {
          const newState = !isCamOn;
          setIsCamOn(newState);
          if (sourceStream) {
            sourceStream.getVideoTracks().forEach((track) => (track.enabled = newState));
          }
        }}
        onScreenShareToggle={handleScreenShareClick}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        onLeave={handleLeaveRoom}
        onAddParticipant={() => setParticipants((prev) => [...prev, prev.length + 1])}
        onRemoveParticipant={() =>
          setParticipants((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
        }
        // New Props
        inputVolume={inputVolume}
        onInputVolumeChange={setInputVolume}
        outputVolume={outputVolume}
        onOutputVolumeChange={setOutputVolume}
        onDeviceChange={handleDeviceChange}
        onMenuOpenChange={setIsAnyMenuOpen}
      />

      {/* Screen Share Picker Modal */}
      <ScreenSharePicker
        isOpen={isScreenPickerOpen}
        onClose={() => setIsScreenPickerOpen(false)}
        onStartShare={handleStartShare}
      />
    </div>
  );
}
