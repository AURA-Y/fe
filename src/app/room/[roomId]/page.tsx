"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { fetchToken } from "@/lib/api";
import "@livekit/components-styles";
import "./styles.css";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const [token, setToken] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // URL 쿼리 파라미터에서 사용자 이름 가져오기
    const userNameFromQuery = searchParams.get("userName");
    const finalUserName = userNameFromQuery || `User-${Math.floor(Math.random() * 1000)}`;
    setUserName(finalUserName);

    // URL에서 쿼리 파라미터 제거 (깔끔한 URL)
    if (userNameFromQuery) {
      router.replace(`/room/${roomId}`, { scroll: false });
    }

    // Backend에서 Token 받아오기
    async function getToken() {
      try {
        const token = await fetchToken(roomId, finalUserName);
        console.log("Token received: Success");
        setToken(token);
        setIsReady(true);
      } catch (error) {
        console.error("Failed to get token:", error);
        alert("서버 연결 실패! Backend가 실행 중인지 확인하세요.");
      }
    }

    getToken();
  }, [roomId, searchParams, router]);

  if (!isReady || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1e1f22]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500"></div>
          <p className="text-gray-400">방에 입장하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    // fixed inset-0 z-50: 화면 전체를 덮어서 글로벌 헤더(layout.tsx)를 가림
    <div className="fixed inset-0 z-50 bg-[#1e1f22]">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880"}
        data-lk-theme="default"
        className="h-full"
        connect={true}
        options={{
          adaptiveStream: true,
          dynacast: true,
        }}
        onDisconnected={() => {
          if (confirm("정말 나가시겠습니까?")) {
            router.push("/");
          }
        }}
      >
        {/* LiveKit 기본 VideoConference 컴포넌트 */}
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
