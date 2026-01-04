"use client";

import { attendRoom, createRoom, deleteRoomFromDB, joinRoomInDB } from "@/lib/api/api.room";
import { CreateRoomFormValues, JoinRoomFormValues } from "@/lib/schema/room/roomCreate.schema";
import { errorHandler } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

// 링크를 직접 입력하여, 회의 참여 mutation
export function useJoinRoom() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({ room, user }: JoinRoomFormValues) => {
      // API 호출 - token, url 반환
      const response = await attendRoom({
        roomId: room,
        userName: user,
      });

      // PostgreSQL DB에 참여자 등록 (실패해도 회의 참여는 가능하도록)
      await joinRoomInDB(room).catch(() => {});

      return { room, user, ...response };
    },
    onSuccess: ({ room, user, token }) => {
      // sessionStorage에 저장
      sessionStorage.setItem(`room_${room}_nickname`, user);
      if (token) {
        sessionStorage.setItem(`room_${room}_token`, token);
      }

      // URL에는 roomId만 포함
      router.push(`/room/${room}`);
    },
    onError: async (error, variables) => {
      // 410 Gone 에러일 때만 PostgreSQL DB에서도 방 삭제
      if (axios.isAxiosError(error) && error.response?.status === 410) {
        await deleteRoomFromDB(variables.room).catch(() => {});
      }
      errorHandler(error);
    },
  });

  return mutation;
}

export function useCreateRoom() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (data: CreateRoomFormValues) => {
      // 1. 방 생성 API 호출 (토큰도 함께 반환됨)
      const { roomId, token } = await createRoom({
        userName: data.user,
        roomTitle: data.roomTitle,
        description: data.description,
        maxParticipants: data.maxParticipants,
      });
      return { roomId, user: data.user, token };
    },
    onSuccess: ({ roomId, user, token }) => {
      // sessionStorage에 저장
      sessionStorage.setItem(`room_${roomId}_nickname`, user);
      sessionStorage.setItem(`room_${roomId}_token`, token);

      // URL에는 roomId만 포함
      router.push(`/room/${roomId}`);
    },
    onError: (error) => {
      errorHandler(error);
    },
  });

  return mutation;
}
