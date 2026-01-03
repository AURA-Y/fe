"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VideoTrack, AudioTrack, useParticipants, useTracks } from "@livekit/components-react";
import { Track, LocalAudioTrack, RemoteAudioTrack } from "livekit-client";
import { Avatar3D } from "@/components/avatar/Avatar3D";

// Check if participant is an AI bot
const isAiBot = (identity: string) => identity.toLowerCase().startsWith("ai-bot");

export function VideoGrid() {
  const participants = useParticipants();
  const count = participants.length;
  const screenTracks = useTracks([Track.Source.ScreenShare]);

  const getItemStyle = () => {
    if (count === 1) {
      return {
        width: "100%",
        maxWidth: "1200px",
        maxHeight: "calc(100vh - 160px)", // 화면 높이에서 컨트롤바와 패딩 제외
        aspectRatio: "16/9",
      };
    }
    if (count === 2) {
      return {
        width: "48%",
        maxHeight: "calc(50vh - 80px)",
        minWidth: "300px",
        aspectRatio: "16/9",
      };
    }
    if (count === 3 || count === 4) {
      return {
        width: "48%",
        maxHeight: "calc(50vh - 80px)",
        minWidth: "300px",
        aspectRatio: "16/9",
      };
    }
    return {
      width: "32%",
      maxHeight: "calc(33vh - 60px)",
      minWidth: "250px",
      aspectRatio: "16/9",
    };
  };

  const itemStyle = getItemStyle();

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-[#0b0c15] p-4">
      {screenTracks.length > 0 && (
        <div className="mb-4 w-full">
          {screenTracks.map((trackRef) => (
            <motion.div
              layout
              key={`${trackRef.participant.identity}-screenshare`}
              className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-white/10 bg-[#0f111a] shadow-2xl"
            >
              <VideoTrack
                trackRef={trackRef}
                className="h-full w-full object-contain"
              />
              <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
                화면 공유: {trackRef.participant.name || trackRef.participant.identity}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.div
        layout
        className="flex flex-1 flex-wrap content-center items-center justify-center gap-4 p-4"
      >
        <AnimatePresence mode="popLayout">
          {participants.map((participant) => {
            const videoPublication = participant.getTrackPublication(Track.Source.Camera);
            const audioPublication = participant.getTrackPublication(Track.Source.Microphone);

            const hasVideo = videoPublication?.isSubscribed && !videoPublication?.isMuted;
            const isMuted = audioPublication?.isMuted;
            const isBot = isAiBot(participant.identity);

            // Safely extract MediaStreamTrack for audio analysis
            let audioMediaStreamTrack: MediaStreamTrack | null = null;
            if (audioPublication?.track) {
              const track = audioPublication.track as LocalAudioTrack | RemoteAudioTrack;
              audioMediaStreamTrack = track.mediaStreamTrack;
            }

            return (
              <motion.div
                layout
                key={participant.identity}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                  scale: { duration: 0.2 },
                }}
                className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 shadow-2xl transition-colors duration-200 ${isBot ? "border-purple-500/30 bg-[#1a1a2e]" : "border-white/5 bg-[#171821] hover:border-white/20"
                  }`}
                style={{ ...itemStyle, aspectRatio: "16/9" }}
              >
                {isBot ? (
                  // AI Bot: Show 3D Avatar with lip-sync
                  <Avatar3D
                    audioTrack={audioMediaStreamTrack}
                    isActive={!isMuted}
                    className="h-full w-full"
                  />
                ) : hasVideo && videoPublication?.track ? (
                  <VideoTrack
                    trackRef={{
                      participant: participant,
                      source: Track.Source.Camera,
                      publication: videoPublication,
                    }}
                    className="h-full w-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#2a2a2a] text-4xl font-bold text-white">
                    {participant.name?.[0]?.toUpperCase() ||
                      participant.identity[0]?.toUpperCase() ||
                      "?"}
                  </div>
                )}

                {/* Always render AudioTrack to ensure we hear the audio, even if using it for visualization */}
                {audioPublication?.track && audioPublication?.isSubscribed && (
                  <AudioTrack
                    trackRef={{
                      participant: participant,
                      source: Track.Source.Microphone,
                      publication: audioPublication,
                    }}
                  />
                )}

                {/* Name label - only show for non-bot participants (bot has its own label in Avatar3D) */}
                {!isBot && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-sm font-medium text-white backdrop-blur-md">
                    <span className="max-w-[100px] truncate">
                      {participant.name || participant.identity}
                    </span>
                    {isMuted && (
                      <svg className="h-3 w-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                          clipRule="evenodd"
                        />
                        <line x1="1" y1="1" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
