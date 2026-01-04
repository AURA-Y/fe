"use client";

import { useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { useIsMaster } from "@/hooks/use-room-master";
import { deleteRoomFromDB } from "@/lib/api/api.room";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 하단 버튼 (컨트롤 바 & 나가기)
 * [컴포넌트: CustomLeaveButton]
 * 커스텀 '나가기' 버튼입니다.
 * - 방장(Master) 권한이 있는 경우: '회의 종료(방 전체 삭제)' 가능
 * - 일반 참가자: 단순히 방에서 퇴장
 */
export const CustomLeaveButton = ({
  roomId,
  onDisconnected,
}: {
  roomId: string;
  onDisconnected: () => void;
}) => {
  const { isMaster, isLoading } = useIsMaster(roomId);
  const room = useRoomContext();
  const [showOptions, setShowOptions] = useState(false);

  const handleEndMeeting = async () => {
    try {
      await deleteRoomFromDB(roomId);
      console.log("회의가 종료되었습니다.");
      room?.disconnect();
      onDisconnected();
    } catch (error) {
      console.error("회의 종료 실패:", error);
    }
  };

  const handleLeaveMeeting = () => {
    room?.disconnect();
    onDisconnected();
  };

  const handleLeaveClick = () => {
    if (isMaster) {
      setShowOptions(!showOptions);
    } else {
      handleLeaveMeeting();
    }
  };

  return (
    <div className="relative">
      {/* 회의 종료 / 회의 나가기 옵션 (master만) */}
      <AnimatePresence>
        {showOptions && isMaster && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 bottom-full mb-4 flex w-48 flex-col gap-2 rounded-[24px] border border-white/20 bg-white/20 p-3 backdrop-blur-2xl shadow-xl shadow-black/10"
          >
            <button
              onClick={handleEndMeeting}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 px-4 py-3 text-sm font-bold text-red-100 transition-all hover:from-red-500/30 hover:to-pink-500/30 border border-white/10 hover:scale-[1.02]"
            >
              회의 종료
            </button>
            <button
              onClick={handleLeaveMeeting}
              className="flex w-full items-center justify-center rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 border border-white/10 hover:scale-[1.02]"
            >
              회의 나가기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 나가기 버튼 */}
      <button
        onClick={handleLeaveClick}
        className={cn(
          "flex h-12 items-center justify-center rounded-full px-8 text-sm font-bold text-white shadow-xl transition-all duration-300",
          "bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 bg-[length:200%_auto] animate-gradient",
          "hover:shadow-rose-500/40 hover:scale-105 active:scale-95",
          "border border-white/20 backdrop-blur-sm",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
        disabled={isLoading}
      >
        Leave
      </button>
    </div>
  );
};
