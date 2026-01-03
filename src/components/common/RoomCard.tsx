"use client";

import { Room } from "@/lib/types/room.type";
import { Users, Calendar, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useJoinRoom } from "@/hooks/use-livekit-token";
import { useAuthStore } from "@/lib/store/auth.store";

interface RoomInfo {
  roomId: string;
  topic: string;
  description?: string;
  maxParticipants: number;
  createdAt: string;
  master: string;
  masterUser?: {
    userId: string;
    email: string;
    nickName: string;
  };
}

export default function RoomCard({ room }: { room: Room | RoomInfo }) {
  const { mutate: joinRoom, isPending } = useJoinRoom();
  const user = useAuthStore((state) => state.user);

  const handleJoin = () => {
    // 로그인 안되어 있을 때 처리 로직 필요 (예: 모달 띄우기)
    // 현재는 김철수 하드코딩 되어있던 부분을 실제 유저 닉네임 유무에 따라 처리하도록 변경 필요하지만
    // 일단 로그인된 유저가 있다면 그 이름을 사용하도록 수정
    joinRoom({
      room: room.roomId,
      user: user?.nickName || "Guest",
    });
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden border-slate-100 bg-white p-6 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            Active
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Users size={14} />
            <span className="text-xs">{room.maxParticipants}명 정원</span>
          </div>
        </div>

        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-slate-900 dark:text-slate-100">
          {"roomTitle" in room ? room.roomTitle : room.topic}
        </h3>
        <p className="mb-6 line-clamp-2 h-10 text-sm text-slate-500">
          {"description" in room && room.description ? room.description : "설명이 없는 회의방입니다."}
        </p>

        <div className="flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-[11px] tracking-wider text-slate-400 uppercase">
              {"masterUser" in room && room.masterUser ? room.masterUser.nickName : "Host"}
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-400">
              {format(new Date(room.createdAt), "yyyy.MM.dd")}
            </span>
          </div>
          <Button
            onClick={handleJoin}
            disabled={isPending}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            참여하기 <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
