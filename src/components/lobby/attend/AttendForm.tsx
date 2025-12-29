"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinRoomSchema, JoinRoomFormValues } from "@/lib/schema/auth.schema";
import { useAuthStore } from "@/lib/store/auth.store";
import { useJoinRoom } from "@/hooks/use-livekit-token";
import { extractRoomId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

export default function AttendForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { mutate: joinRoom, isPending } = useJoinRoom();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JoinRoomFormValues>({
    // resolver를 커스텀하게 설정하거나, 스키마를 부분적으로 적용해야 함
    // 여기서는 간단하게 room 필드만 검증하도록 처리
    resolver: async (values, context, options) => {
      const result = await zodResolver(joinRoomSchema)(
        { ...values, user: user?.nickname || "anonymous" },
        context,
        options
      );
      return result;
    },
  });

  // 로그인 체크
  useEffect(() => {
    if (!user) {
      toast.error("로그인이 필요한 서비스입니다.");
      router.push("/login"); // 로그인 페이지로 리다이렉트
    }
  }, [user, router]);

  const onSubmit = (data: JoinRoomFormValues) => {
    if (!user) return; // 한번 더 체크

    const roomId = extractRoomId(data.room);

    // useJoinRoom 훅 호출
    joinRoom({
      room: roomId,
      user: user.nickname,
    });
  };

  if (!user) return null; // 로그인 전이면 렌더링 안함 (useEffect에서 처리)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="room" className="text-foreground text-sm font-medium">
          회의 링크 또는 ID
        </label>
        <div className="relative">
          <Link2 className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="room"
            {...register("room")}
            placeholder="예: meeting-123 또는 전체 링크"
            className="focus:ring-primary/20 pl-10 transition-all focus:ring-2"
          />
        </div>
        {errors.room && <p className="text-destructive text-xs">{errors.room.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white transition-all hover:shadow-lg"
      >
        {isPending ? "참여 중..." : "참여하기"}
      </Button>
    </form>
  );
}
