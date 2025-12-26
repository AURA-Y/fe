"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { LobbyFormValues, lobbySchema } from "@/lib/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { extractRoomId } from "@/lib/utils";

// 1. Props 타입 정의
interface LobbyModalProps {
  isOpen: boolean;
  type: "create" | "join";
  onClose: () => void;
  onSubmit: (data: { room: string; user: string }) => void; // 부모의 mutate 함수를 받음
  isLoading: boolean;
}

export default function LobbyModal({
  isOpen,
  type,
  onClose,
  onSubmit, // 여기도 수정
  isLoading,
}: LobbyModalProps) {
  const isCreate = type === "create";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LobbyFormValues>({
    resolver: zodResolver(lobbySchema),
  });

  const onFormSubmit = (data: LobbyFormValues) => {
    const cleanRoomId = extractRoomId(data.room);
    onSubmit({ room: cleanRoomId, user: data.user });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  {isCreate ? (
                    <>
                      <Plus className="text-blue-500" /> 방 생성
                    </>
                  ) : (
                    <>
                      <LogIn className="text-green-500" /> 방 입장
                    </>
                  )}
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isCreate ? "방 이름" : "방 링크 또는 ID"}
                  </label>
                  <Input
                    {...register("room")}
                    placeholder={isCreate ? "예: 주간 회의" : "링크를 붙여넣으세요"}
                  />
                  {errors.room && <p className="text-destructive text-xs">{errors.room.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">닉네임</label>
                  <Input {...register("user")} placeholder="사용하실 이름" />
                  {errors.user && <p className="text-destructive text-xs">{errors.user.message}</p>}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${isCreate ? "bg-blue-600" : "bg-green-600"}`}
                >
                  {isLoading ? "입장 중..." : isCreate ? "생성하고 입장" : "입장하기"}
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
