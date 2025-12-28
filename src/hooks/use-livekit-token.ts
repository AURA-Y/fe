"use client";

import { fetchLiveKitToken } from "@/lib/api/api.auth";
import { createRoom } from "@/lib/api/api.room";
import { CreateRoomFormValues, JoinRoomFormValues } from "@/lib/schema/room/roomCreate.schema";
import { errorHandler } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useJoinRoom() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({ room, user }: JoinRoomFormValues) => {
      const token = await fetchLiveKitToken(room, user);
      return { room, user, token };
    },
    onSuccess: ({ room, user, token }) => {
      router.push(`/room/${room}?nickname=${user}&token=${token}`);
      toast.success("회의실로 입장합니다.");
    },
    onError: () => toast.error("입장에 실패했습니다. 방 번호를 확인하세요."),
  });

  return mutation;
}

export function useCreateRoom() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: CreateRoomFormValues) => {
      const response = await createRoom({
        userName: values.user, // user -> userName 매핑
        roomTitle: values.roomTitle, // 선택 필드 전달
        description: values.description, // 선택 필드 전달
        maxParticipants: values.maxParticipants,
      });

      return response;
    },
    onSuccess: (data) => {
      const { roomId, userName, token } = data;

      // router.push(`/room/${roomId}`); (X)
      // 이유1 : LiveKit Token을 실고 가야 회의방을 생성할 수 있다는 LiveKit 규칙이기에, searchParams에 실고 간다.
      // 이유2 : Zustand나 Context API에 토큰을 저장하는 방법1 , 페이지를 **'새로고침'** 시, 방을 나가지는 것을 방지
      router.push(`/room/${roomId}?nickname=${userName}&token=${token}`);
      toast.success("방이 생성되었습니다.");
    },
    onError: (error) => {
      errorHandler(error);
    },
  });

  return mutation;
}
