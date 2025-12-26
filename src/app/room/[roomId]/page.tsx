"use client";

import LiveKitView from "@/components/room/LiveKitView";
import { useLiveKitToken } from "@/hooks/use-livekit-token";
import { useParams, useRouter } from "next/navigation";

export default function page() {
  const { roomId } = useParams();
  const router = useRouter();

  // LiveKitToken 커스텀 훅에서 꺼내기
  const { token, isLoading, isError, requestToken } = useLiveKitToken();

  if (token)
    return (
      <div>
        <LiveKitView token={token} onDisconnected={() => router.push("/")} />
      </div>
    );

  return <div>page</div>;
}
