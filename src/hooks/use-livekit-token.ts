"use client";

import { fetchLiveKitToken } from "@/lib/api/auth/api.auth";
import { createRoom } from "@/lib/api/room/api.room";
import { CreateRoomFormValues, JoinRoomFormValues } from "@/lib/schema/auth.schema";
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
    mutationFn: async ({ user }: CreateRoomFormValues) => {
      // 1. 방 생성 API 호출
      const { roomId } = await createRoom(user);
      // 2. 해당 방의 토큰 발급
      const token = await fetchLiveKitToken(roomId, user);
      return { roomId, user, token };
    },
    onSuccess: ({ roomId, user, token }) => {
      router.push(`/room/${roomId}?nickname=${user}&token=${token}`);
      toast.success("방이 생성되었습니다.");
    },
    onError: () => toast.error("방 생성에 실패했습니다."),
  });

  return mutation;
}
