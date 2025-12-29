"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../input";
import { Button } from "../button";
import { LobbyFormValues, lobbySchema } from "@/lib/schema/room/roomCreate.schema";

interface LobbyFormProps {
  onSubmit: (data: LobbyFormValues) => void;
  isLoading: boolean;
}

const LobbyForm = ({ onSubmit, isLoading }: LobbyFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LobbyFormValues>({
    resolver: zodResolver(lobbySchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">방 이름</label>
        <Input {...register("room")} placeholder="예: my-room-1" />
        {errors.room && <p className="text-destructive text-xs">{errors.room.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">닉네임</label>
        <Input {...register("user")} placeholder="예: alice" />
        {errors.user && <p className="text-destructive text-xs">{errors.user.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "토큰 발급 중..." : "입장하기"}
      </Button>
    </form>
  );
};

export default LobbyForm;
