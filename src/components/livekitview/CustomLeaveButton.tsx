"use client";

import { useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { useIsMaster } from "@/hooks/use-room-master";
import { getRoomInfoFromDB, deleteRoomFromLiveKit } from "@/lib/api/api.room";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateReportSummary, useDeleteReport } from "@/hooks/use-reports";
import { useDeleteRoomFromDB } from "@/hooks/use-create-meeting";
import { errorHandler } from "@/lib/utils";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export const CustomLeaveButton = ({
  roomId,
  onDisconnected,
}: {
  roomId: string;
  onDisconnected: () => void;
}) => {
  const { isMaster, isLoading } = useIsMaster(roomId);
  const room = useRoomContext();
  const [modalStep, setModalStep] = useState<null | "summary" | "confirm">(null);
  const queryClient = useQueryClient();
  const updateSummaryMutation = useUpdateReportSummary();
  const deleteReportMutation = useDeleteReport();
  const deleteRoomMutation = useDeleteRoomFromDB();

  const handleSummary = async () => {
    try {
      // roomId로 reportId 조회
      const roomInfo = await getRoomInfoFromDB(roomId);
      if (!roomInfo.reportId) {
        toast.error("회의록 정보를 찾을 수 없습니다.");
        return;
      }

      // 회의록 요약 저장 + roomId 전달하여 attendees 닉네임 변환
      try {
        await updateSummaryMutation.mutateAsync({
          reportId: roomInfo.reportId,
          summary: "(구현 예정) 회의록 요약을 여기에 넣을것입니다.",
          roomId, // roomId 추가: userId -> 닉네임 변환에 사용
        });
      } catch (summaryError) {
        // 404 에러는 회의록이 이미 삭제된 경우이므로 무시하고 계속 진행
        console.warn("Report summary update failed (report may not exist):", summaryError);
      }

      // LiveKit 서버에서 회의방 삭제 (모든 참가자 자동 disconnect)
      try {
        await deleteRoomFromLiveKit(roomId);
        console.log("LiveKit room deleted successfully:", roomId);
      } catch (livekitError: any) {
        // 404 에러는 이미 삭제된 경우이므로 무시
        console.error("LiveKit room deletion failed:", {
          roomId,
          status: livekitError?.response?.status,
          message: livekitError?.response?.data?.message || livekitError?.message,
          error: livekitError,
        });
      }

      // PostgreSQL DB에서 회의방 삭제
      await deleteRoomMutation.mutateAsync(roomId);

      // React Query 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["Rooms"] });

      // 회의방에서 나가기
      room?.disconnect();
      onDisconnected();
    } catch (error) {
      errorHandler(error);
    }
  };

  const handleEndMeeting = async () => {
    try {
      // roomId로 reportId 조회
      const roomInfo = await getRoomInfoFromDB(roomId);

      // reportId가 있으면 삭제 (실패해도 계속 진행)
      if (roomInfo.reportId) {
        try {
          await deleteReportMutation.mutateAsync(roomInfo.reportId);
        } catch (reportError) {
          // 회의록 삭제 실패해도 계속 진행
        }
      }

      // LiveKit 서버에서 회의방 삭제 (모든 참가자 자동 disconnect)
      try {
        await deleteRoomFromLiveKit(roomId);
        console.log("LiveKit room deleted successfully:", roomId);
      } catch (livekitError: any) {
        // 404 에러는 이미 삭제된 경우이므로 무시
        console.error("LiveKit room deletion failed:", {
          roomId,
          status: livekitError?.response?.status,
          message: livekitError?.response?.data?.message || livekitError?.message,
          error: livekitError,
        });
      }

      // PostgreSQL DB에서 회의방 삭제
      await deleteRoomMutation.mutateAsync(roomId);

      // React Query 캐시 무효화 - 홈페이지에서 최신 데이터 로드하도록
      queryClient.invalidateQueries({ queryKey: ["Rooms"] });

      room?.disconnect();
      onDisconnected();
    } catch (error) {
      errorHandler(error);
    }
  };

  const handleLeaveMeeting = () => {
    room?.disconnect();
    onDisconnected();
  };

  const handleLeaveClick = () => {
    if (isMaster) {
      setModalStep("summary");
    } else {
      handleLeaveMeeting();
    }
  };

  return (
    <>
      {/* 요약 모달 */}
      <ConfirmDialog
        isOpen={modalStep === "summary"}
        onOpenChange={(open) => !open && setModalStep(null)}
        title="회의록 요약"
        description="회의록을 요약하시겠습니까?"
        buttons={[
          {
            label: "요약",
            onClick: handleSummary,
            className:
              "flex items-center justify-center rounded-full bg-blue-600 px-6 font-bold text-white hover:bg-blue-700",
          },
          {
            label: "회의 나가기",
            onClick: () => setModalStep("confirm"),
            variant: "outline",
            className: "flex items-center justify-center rounded-full px-6 font-bold",
          },
        ]}
      />

      {/* 회의 종료 확인 모달 */}
      <ConfirmDialog
        isOpen={modalStep === "confirm"}
        onOpenChange={(open) => !open && setModalStep(null)}
        title="회의 종료"
        description="회의를 종료하시겠습니까?"
        buttons={[
          {
            label: "회의 종료",
            onClick: handleEndMeeting,
            className:
              "flex items-center justify-center rounded-full bg-red-600 px-6 font-bold text-white hover:bg-red-700",
          },
          {
            label: "회의 나가기",
            onClick: handleLeaveMeeting,
            variant: "outline",
            className: "flex items-center justify-center rounded-full px-6 font-bold",
          },
        ]}
      />

      {/* 나가기 버튼 */}
      <button
        onClick={handleLeaveClick}
        className="lk-button !border !border-red-600 font-bold !text-red-600"
        disabled={isLoading}
      >
        Leave
      </button>
    </>
  );
};
