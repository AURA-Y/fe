"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import {
  JoinRoomFormValues,
  CreateRoomFormValues,
  joinRoomSchema,
  createRoomSchema,
} from "@/lib/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { extractRoomId } from "@/lib/utils";

// 1. Props 타입 정의
interface LobbyModalProps {
  isOpen: boolean;
  type: "create" | "join";
  onClose: () => void;
  onSubmit: (data: JoinRoomFormValues | CreateRoomFormValues) => void;
  isLoading: boolean;
}

export default function LobbyModal({
  isOpen,
  type,
  onClose,
  onSubmit,
  isLoading,
}: LobbyModalProps) {
  const isCreate = type === "create";

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinRoomFormValues | CreateRoomFormValues>({
    resolver: zodResolver(isCreate ? createRoomSchema : joinRoomSchema),
  });

  // Re-initialize form when type changes or opens
  // This is handled by "key={modalType}" in parent usually, or we can use useEffect here.

  const onFormSubmit = (data: JoinRoomFormValues | CreateRoomFormValues) => {
    if (isCreate) {
      onSubmit(data as CreateRoomFormValues);
    } else {
      const joinData = data as JoinRoomFormValues;
      const cleanRoomId = extractRoomId(joinData.room);
      onSubmit({ ...joinData, room: cleanRoomId });
    }
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
                {!isCreate && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">방 링크 또는 ID</label>
                    <Input {...register("room")} placeholder="링크를 붙여넣으세요" />
                    {(errors as any).room && (
                      <p className="text-destructive text-xs">{(errors as any).room.message}</p>
                    )}
                  </div>
                )}

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
                  {isLoading ? "처리 중..." : isCreate ? "방 생성하기" : "입장하기"}
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
