"use client";

import { useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { useIsMaster } from "@/hooks/use-room-master";
import { deleteRoomFromDB } from "@/lib/api/api.room";

/**
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
      {showOptions && isMaster && (
        <div className="absolute right-0 bottom-full mb-2 flex flex-col gap-2">
          <button
            onClick={handleEndMeeting}
            className="lk-button whitespace-nowrap shadow-lg"
            style={{ color: "#ef4444" }}
          >
            회의 종료
          </button>
          <button
            onClick={handleLeaveMeeting}
            className="lk-button whitespace-nowrap shadow-lg"
            style={{ color: "#ef4444" }}
          >
            회의 나가기
          </button>
        </div>
      )}

      {/* 나가기 버튼 */}
      <button
        onClick={handleLeaveClick}
        className="lk-button !border !border-red-600 !text-red-600"
        disabled={isLoading}
      >
        Leave
      </button>
    </div>
  );
};
