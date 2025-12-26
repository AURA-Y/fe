"use client";

import { fetchLiveKitToken } from "@/lib/api/auth/api.auth";
import { LobbyFormValues } from "@/lib/schema/auth.schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useLiveKitToken() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: ({ room, user }: LobbyFormValues) => fetchLiveKitToken(room, user),
    onSuccess: (token, variables) => {
      router.push(`/room/${variables.room}?nickname=${variables.user}&token=${token}`);
      toast.success("회의실로 입장합니다.");
    },
    onError: () => toast.error("토큰 발급에 실패했습니다. 서버 상태를 확인하세요."),
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
}
