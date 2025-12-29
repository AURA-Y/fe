import { motion, AnimatePresence } from "framer-motion";
import { MicOff, Headphones } from "lucide-react";
import { useState, useEffect } from "react";
import { RemotePeer } from "@/hooks/use-mediasoup";

interface VideoGridProps {
  localStream?: MediaStream | null;
  remotePeers: Map<string, RemotePeer>;
  isMicOn: boolean;
  isScreenSharing: boolean;
  userNickname?: string;
  localIsSpeaking?: boolean;
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
  useEffect(() => setIsMounted(true), []);

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
          {peers.map((peer, i) => (
            <motion.div
              layout
              key={peer.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-white/5 bg-[#171821] shadow-2xl hover:border-white/20"
              style={{ ...itemStyle, aspectRatio: "16/9" }}
            >
              <div className="flex h-full w-full flex-col items-center justify-center">
                {peer.stream ? (
                  <video
                    autoPlay
                    playsInline
                    ref={(video) => {
                      if (video && peer.stream && video.srcObject !== peer.stream) {
                        video.srcObject = peer.stream;
                      }
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-700 text-2xl font-bold text-white">
                    {peer.displayName?.[0] || "P"}
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-sm font-medium text-white backdrop-blur-md">
                <span className="max-w-[100px] truncate">
                  {peer.displayName || `User ${peer.id.substr(0, 4)}`}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
