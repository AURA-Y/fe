import { motion, AnimatePresence } from "framer-motion";
import { MicOff, Headphones } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { RemotePeer } from "@/hooks/use-mediasoup";

interface VideoGridProps {
  localStream?: MediaStream | null;
  remotePeers: Map<string, RemotePeer>;
  isMicOn: boolean;
  isScreenSharing: boolean;
  userNickname?: string;
  localIsSpeaking?: boolean;
}

// Separate component for remote peer video to handle stream updates properly
function RemotePeerVideo({
  peer,
  itemStyle,
  shouldAutoUnmute
}: {
  peer: RemotePeer;
  itemStyle: any;
  shouldAutoUnmute: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Track muted state for UI
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if peer is speaking
  const hasAttemptedUnmute = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  // Audio level detection for remote peer
  useEffect(() => {
    if (!peer.stream) return;

    const audioTrack = peer.stream.getAudioTracks()[0];
    if (!audioTrack) {
      console.log(`[RemotePeerVideo] No audio track for peer ${peer.id}`);
      return;
    }

    // Create AudioContext for analyzing remote peer's audio
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    // Create a MediaStream with just the audio track
    const audioStream = new MediaStream([audioTrack]);
    const sourceNode = ctx.createMediaStreamSource(audioStream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;

    sourceNode.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const threshold = 0.1; // Threshold for detecting speech

    const detectSpeaking = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const normalizedVol = rms / 255;

      setIsSpeaking(normalizedVol > threshold);

      rafRef.current = requestAnimationFrame(detectSpeaking);
    };

    detectSpeaking();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ctx.state !== "closed") ctx.close();
    };
  }, [peer.stream, peer.id]);

  // Auto-unmute effect when shouldAutoUnmute becomes true
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldAutoUnmute || hasAttemptedUnmute.current) return;

    console.log(`[RemotePeerVideo] Auto-unmuting peer ${peer.id} due to user interaction`);
    hasAttemptedUnmute.current = true;

    video.muted = false;
    video.volume = 1.0;

    video.play()
      .then(() => {
        console.log(`[RemotePeerVideo] ✓ Auto-unmuted successfully for peer ${peer.id}`);
        setIsVideoMuted(false);
      })
      .catch((err) => {
        console.log(`[RemotePeerVideo] Auto-unmute failed, keeping muted:`, err.message);
        video.muted = true;
        setIsVideoMuted(true);
      });
  }, [shouldAutoUnmute, peer.id]);

  // This useEffect runs whenever peer.stream changes (when tracks are added)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !peer.stream) {
      console.log(`[RemotePeerVideo] Skipping - no video element or stream for peer ${peer.id}`);
      return;
    }

    const tracks = peer.stream.getTracks();
    console.log(`[RemotePeerVideo] Stream updated for peer ${peer.id}, tracks:`, tracks.length, tracks.map(t => `${t.kind}(id:${t.id.slice(0,8)})`));

    // Skip if no tracks yet (wait for actual media)
    if (tracks.length === 0) {
      console.log(`[RemotePeerVideo] Skipping play() - no tracks yet for peer ${peer.id}`);
      return;
    }

    // Only set srcObject if it's different
    if (video.srcObject !== peer.stream) {
      console.log(`[RemotePeerVideo] Setting srcObject for peer ${peer.id}`);
      video.srcObject = peer.stream;
    } else {
      console.log(`[RemotePeerVideo] srcObject already set, checking video dimensions...`);
      // Stream object is the same, but tracks might have been added
      // Wait a bit for video to load
      setTimeout(() => {
        console.log(`[RemotePeerVideo] Video dimensions after delay:`, {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          readyState: video.readyState
        });
      }, 500);
    }

    // Try unmuted first, then fallback to muted
    video.muted = false;
    video.volume = 1.0;

    // Attempt to play (only when we have tracks)
    console.log(`[RemotePeerVideo] Calling play() UNMUTED for peer ${peer.id}...`);
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`[RemotePeerVideo] ✓✓✓ Video PLAYING UNMUTED for peer ${peer.id}`);
          setIsVideoMuted(false);
          // Log video dimensions after play
          setTimeout(() => {
            console.log(`[RemotePeerVideo] Video dimensions for peer ${peer.id}:`, {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState,
              muted: video.muted,
              tracks: peer.stream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, muted: t.muted, readyState: t.readyState }))
            });
          }, 1000);
        })
        .catch((err) => {
          console.log(`[RemotePeerVideo] Unmuted play failed (${err.name}), trying muted:`, err.message);
          video.muted = true;
          setIsVideoMuted(true);
          video.play()
            .then(() => {
              console.log(`[RemotePeerVideo] ✓ Now playing MUTED for peer ${peer.id}`);
            })
            .catch((mutedErr) => {
              console.error(`[RemotePeerVideo] ✗ Even muted play failed:`, mutedErr);
            });
        });
    }
  }, [peer.stream, peer.id]);

  return (
    <motion.div
      layout
      key={peer.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl border-2 bg-[#171821] shadow-2xl transition-colors duration-200 ${
        isSpeaking
          ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
          : "border-white/5 hover:border-white/20"
      }`}
      style={{ ...itemStyle, aspectRatio: "16/9" }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover cursor-pointer"
        style={{ transform: "scaleX(-1)" }} // Mirror remote video like local video
        onClick={(e) => {
          const video = e.currentTarget;
          console.log(`[RemotePeerVideo] Video clicked! Current state:`, {
            muted: video.muted,
            paused: video.paused,
            volume: video.volume,
            readyState: video.readyState,
          });

          if (video.muted) {
            video.muted = false;
            video.volume = 1.0;
            setIsVideoMuted(false);
            console.log(`[RemotePeerVideo] Unmuted peer ${peer.id} via click, attempting play...`);

            video.play()
              .then(() => {
                console.log(`[RemotePeerVideo] ✓ Now playing UNMUTED for peer ${peer.id}`);
              })
              .catch((err) => {
                console.error(`[RemotePeerVideo] Unmuted play failed:`, err.message);
                video.muted = true;
                setIsVideoMuted(true);
              });
          }

          // Also try to play if paused
          if (video.paused) {
            console.log(`[RemotePeerVideo] Video was paused, playing...`);
            video.play().catch(console.error);
          }
        }}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          console.log(`[RemotePeerVideo] Video metadata loaded for peer ${peer.id}:`, {
            paused: video.paused,
            muted: video.muted,
            readyState: video.readyState,
            tracks: peer.stream?.getTracks().length,
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
          });
        }}
        onPlay={(e) => {
          const video = e.currentTarget;
          console.log(`[RemotePeerVideo] 🎬 onPlay event fired for peer ${peer.id}, muted: ${video.muted}`);
        }}
        onPause={() => {
          console.log(`[RemotePeerVideo] ⏸️ onPause event fired for peer ${peer.id}`);
        }}
      />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-sm font-medium text-white backdrop-blur-md">
        <span className="max-w-[100px] truncate">{peer.displayName || `User ${peer.id.slice(0, 4)}`}</span>
      </div>

      {/* Unmute Indicator - Show when video is muted */}
      {isVideoMuted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30">
          <div className="flex flex-col items-center gap-2 rounded-lg bg-black/80 px-6 py-4 text-center backdrop-blur-md">
            <div className="flex items-center gap-2 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                <line x1="1" y1="1" x2="23" y2="23" strokeWidth={2} strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-semibold">음소거 상태</span>
            </div>
            <p className="text-xs text-gray-300">클릭하여 소리 켜기</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function VideoGrid({
  localStream,
  remotePeers,
  isMicOn,
  isScreenSharing,
  userNickname,
  localIsSpeaking,
}: VideoGridProps) {
  // Convert peers map to array for rendering
  const peers = Array.from(remotePeers.values());
  const count = 1 + peers.length; // Local + Remotes
  const isSpeaking = localIsSpeaking || false;

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  // Set up global interaction listener to auto-unmute videos
  useEffect(() => {
    if (hasUserInteracted) return;

    const handleInteraction = () => {
      console.log('[VideoGrid] User interaction detected, enabling auto-unmute');
      setHasUserInteracted(true);
    };

    // Listen for any user interaction
    const events = ['click', 'keydown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });

    // Also auto-trigger after a short delay (assumes user clicked to enter the room)
    const timer = setTimeout(() => {
      console.log('[VideoGrid] Auto-enabling unmute after delay');
      setHasUserInteracted(true);
    }, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
      clearTimeout(timer);
    };
  }, [hasUserInteracted]);

  const getItemStyle = () => {
    if (count === 1) return { width: "100%", maxWidth: "1200px" };
    if (count === 2) return { width: "48%" };
    if (count === 3) return { width: "32%" };
    if (count === 4) return { width: "48%" };
    if (count >= 5) return { width: "32%" };
    return { width: "32%" };
  };

  const itemStyle = getItemStyle();

  if (!isMounted) return null;

  return (
    <div className="customized-scroll flex flex-1 items-center justify-center overflow-y-auto bg-[#0b0c15] p-4">
      <motion.div
        layout
        className="flex h-full w-full flex-wrap content-center items-center justify-center gap-4 p-4"
      >
        <AnimatePresence mode="popLayout">
          {/* 1. Local User */}
          <motion.div
            layout
            key="local-user"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-white/5 bg-[#171821] shadow-2xl transition-colors duration-200 ${
              isMicOn && isSpeaking
                ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                : "hover:border-white/20"
            }`}
            style={{ ...itemStyle, aspectRatio: "16/9" }}
          >
            <div className="group flex h-full w-full flex-col items-center justify-center gap-3 transition-transform duration-300">
              {localStream ? (
                <>
                  <video
                    autoPlay
                    playsInline
                    muted={!isMonitoring}
                    ref={(video) => {
                      if (video && localStream && video.srcObject !== localStream) {
                        video.srcObject = localStream;
                      }
                    }}
                    className="h-full w-full object-cover"
                    style={{ transform: "scaleX(-1)" }} // Mirror local video
                  />
                  <button
                    onClick={() => setIsMonitoring(!isMonitoring)}
                    className={`absolute top-3 right-3 z-10 rounded-full p-2 transition-all ${
                      isMonitoring
                        ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        : "bg-black/40 text-slate-400 hover:bg-black/60 hover:text-white"
                    }`}
                  >
                    <Headphones size={16} />
                  </button>
                </>
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-700 text-4xl font-bold text-white shadow-lg">
                  {userNickname?.[0] || "M"}
                </div>
              )}
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-sm font-medium text-white backdrop-blur-md">
              <span className="max-w-[100px] truncate">{userNickname || "Me"}</span>
              {!isMicOn && <MicOff className="h-3 w-3 text-red-400" />}
            </div>
            {isScreenSharing && (
              <div className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                화면 공유 중
              </div>
            )}
            {isMonitoring && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-bold whitespace-nowrap text-white shadow-lg backdrop-blur-sm">
                내 소리 듣는 중 (하울링 주의 🎧)
              </div>
            )}
          </motion.div>

          {/* 2. Remote Peers */}
          {peers.map((peer) => (
            <RemotePeerVideo
              key={peer.id}
              peer={peer}
              itemStyle={itemStyle}
              shouldAutoUnmute={hasUserInteracted}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
