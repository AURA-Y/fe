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
        token={token}
        onDisconnected={() => {
          // 퇴장 시 sessionStorage 정리
          sessionStorage.removeItem(`room_${roomId}_token`);
          sessionStorage.removeItem(`room_${roomId}_nickname`);
          router.push("/");
        }}
      />
    </div>
  );
}
