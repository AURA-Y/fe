"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, LogIn, Video } from "lucide-react";
import { useJoinRoom, useCreateRoom } from "@/hooks/use-livekit-token";
import LobbyModal from "@/components/lobby/LobbyModal";
import { CreateRoomFormValues, JoinRoomFormValues } from "@/lib/schema/auth.schema";

export default function HomePage() {
  // token 갖고오기

  // 모달 제어 상태
  const [modalType, setModalType] = useState<"create" | "join" | null>(null);

  const { mutate: joinMutate, isPending: isJoining } = useJoinRoom();
  const { mutate: createMutate, isPending: isCreating } = useCreateRoom();

  const handleSubmit = (data: JoinRoomFormValues | CreateRoomFormValues) => {
    if ("room" in data) {
      joinMutate(data);
    } else {
      createMutate(data);
    }
  };

  const isLoading = isJoining || isCreating;

  return (
    <main className="bg-muted/50 relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* 배경 장식 (생략) */}

      <Card className="z-10 w-full max-w-md border-white/20 bg-white/80 shadow-xl backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex justify-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-center text-3xl font-bold text-transparent">
            <Video className="h-8 w-8 text-blue-600" /> LiveKit Aura
          </CardTitle>
          <p className="mt-2 text-center text-sm text-gray-500">실시간 화상 회의를 시작해보세요</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-6">
          <Button
            size="lg"
            className="bg-linear-to-r from-blue-500 to-blue-600"
            onClick={() => setModalType("create")}
          >
            <Plus className="mr-2 h-5 w-5" /> 방 생성
          </Button>
          <Button variant="outline" size="lg" onClick={() => setModalType("join")}>
            <LogIn className="mr-2 h-5 w-5" /> 방 입장
          </Button>
        </CardContent>
      </Card>

      <LobbyModal
        key={modalType} // ⭐️ 모달 타입이 바뀔 때마다 내부 폼을 완전히 초기화함
        isOpen={!!modalType}
        type={modalType || "create"}
        onClose={() => setModalType(null)}
        onSubmit={handleSubmit} // 훅에서 제공하는 실행 함수 전달
        isLoading={isLoading}
      />
    </main>
  );
}
