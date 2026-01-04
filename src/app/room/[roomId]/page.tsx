"use client";

import { useEffect, useState } from "react";
import LiveKitView from "@/components/room/LiveKitView";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";
import { requestMediaPermissions } from "@/lib/utils/media.utils";
import { Loader2 } from "lucide-react";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { user, accessToken, isHydrated } = useAuthStore();

  const [token, setToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Zustand hydration 대기
    if (!isHydrated) return;

    if (!roomId) {
      router.push("/");
      return;
    }

    // 인증 체크 (API 호출을 위한 accessToken)
    if (!user || !accessToken) {
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // LiveKit 토큰 체크 (회의방 접속을 위한 token)
    const storedToken = sessionStorage.getItem(`room_${roomId}_token`);

    if (!storedToken) {
      toast.error("회의방 토큰이 없습니다.");
      router.push("/");
      return;
    }

    // 카메라/마이크 권한 먼저 요청
    const handleMediaPermissions = async () => {
      const granted = await requestMediaPermissions();

      if (granted) {
        // 권한 승인 → LiveKit 연결 진행
        setToken(storedToken);
        setPermissionGranted(true);
        setIsLoading(false);
      } else {
        // 권한 거부 또는 장치 없음
        toast.error("카메라/마이크 권한이 필요합니다.", {
          description: "브라우저 설정에서 권한을 허용해주세요.",
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    };

    handleMediaPermissions();
  }, [roomId, router, user, accessToken, isHydrated]);

  // 로딩 중이거나 권한 없으면 로딩 스피너
  if (isLoading || !token || !permissionGranted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <Loader2 className="h-16 w-16 animate-spin text-gray-400" />
      </div>
    );
  }

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
