"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinRoomSchema, JoinRoomFormValues } from "@/lib/schema/auth.schema";
import { useAuthStore } from "@/lib/store/auth.store";
import { useJoinRoom } from "@/hooks/use-livekit-token";
import { extractRoomId } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

export default function AttendForm() {
  const user = useAuthStore((state) => state.user);
  const { mutate: joinRoom, isPending } = useJoinRoom();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinRoomFormValues>({
    resolver: async (values, context, options) => {
      const result = await zodResolver(joinRoomSchema)(
        { ...values, user: user?.nickname || "anonymous" },
        context,
        options
      );
      return result;
    },
  });

  const onSubmit = (data: JoinRoomFormValues) => {
    if (!user) return;

    const roomId = extractRoomId(data.room);

    joinRoom({
      room: roomId,
      user: user.nickname,
    });
  };

  return (
    <>
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
              disabled={!user}
            />
          </div>
          {errors.room && <p className="text-destructive text-xs">{errors.room.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isPending || !user}
          className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white transition-all hover:shadow-lg"
        >
          {isPending ? "참여 중..." : "참여하기"}
        </Button>
      </form>
    </>
  );
}
