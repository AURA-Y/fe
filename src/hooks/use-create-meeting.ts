import { useMutation } from "@tanstack/react-query";
import { createMeeting } from "@/lib/api/api.meeting";
import { createRoomInDB, deleteRoomFromDB, joinRoomInDB } from "@/lib/api/api.room";
import { CreateMeetingSchema } from "@/lib/schema/room/roomAIAgentSetting.schema";
import { CreateRoomInDBParams } from "@/lib/types/room.type";

export const useCreateMeeting = () => {
  return useMutation({
    mutationFn: ({ data, files }: { data: CreateMeetingSchema; files: File[] }) =>
      createMeeting(data, files),
  });
};

/**
 * PostgreSQL에 Room 정보 저장
 * 사용 예: const createRoomMutation = useCreateRoomInDB();
 *          await createRoomMutation.mutateAsync(params);
 */
export const useCreateRoomInDB = () => {
  return useMutation({
    mutationFn: (params: CreateRoomInDBParams) => createRoomInDB(params),
  });
};

/**
 * PostgreSQL에서 Room 삭제
 * 사용 예: const deleteRoomMutation = useDeleteRoomFromDB();
 *          await deleteRoomMutation.mutateAsync(roomId);
 */
export const useDeleteRoomFromDB = () => {
  return useMutation({
    mutationFn: (roomId: string) => deleteRoomFromDB(roomId),
  });
};

/**
 * PostgreSQL Room에 참여자 등록
 * 사용 예: const joinRoomMutation = useJoinRoomInDB();
 *          await joinRoomMutation.mutateAsync(roomId);
 */
export const useJoinRoomInDB = () => {
  return useMutation({
    mutationFn: (roomId: string) => joinRoomInDB(roomId),
  });
};
