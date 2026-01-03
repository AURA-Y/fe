"use client";

import { useEffect, useState } from "react";
import LiveKitView from "@/components/room/LiveKitView";
import { useRouter, useParams } from "next/navigation";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      router.push("/");
      return;
    }

    // sessionStorage에서 토큰 읽기
    const storedToken = sessionStorage.getItem(`room_${roomId}_token`);

    if (!storedToken) {
      // 토큰이 없으면 조용히 홈으로 리다이렉트
      router.push("/");
      return;
    }

    setToken(storedToken);
    setIsLoading(false);
  }, [roomId, router]);

  if (isLoading || !token) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <LiveKitView
        roomId={roomId}
        token={token}
        onDisconnected={() => {
          // 퇴장 시 리다이렉트 (새로고침 시에도 발생할 수 있음)
          // 토큰은 유지하여 재접속 가능하게 함
          router.push("/");
        }}
      />
    </div>
  );
}
