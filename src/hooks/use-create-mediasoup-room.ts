import { useMutation } from "@tanstack/react-query";
import { createMediasoupRoom } from "@/lib/api/api.mediasoup";
import { CreateRoomRequest } from "@/lib/types/mediasoup.type";
import { useRouter } from "next/navigation";

export const useCreateMediasoupRoom = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateRoomRequest) => createMediasoupRoom(data),
    onSuccess: (data) => {
      // 방 생성 성공 시, 받은 response(roomId 등)를 이용해 페이지 이동
      console.log("Room Created:", data);

      // 예: /room/[roomId] 로 이동
      router.push(`/room/${data.roomId}`);
    },
    onError: (error) => {
      console.error("Failed to create room:", error);
      alert("방 생성에 실패했습니다.");
    },
  });
};
