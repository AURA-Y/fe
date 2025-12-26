"use client";

import { useEffect } from "react";
import LiveKitView from "@/components/room/LiveKitView";
import { useRouter, useSearchParams } from "next/navigation";

export default function RoomPage() {
  //http://localhost:3000/room/my-meeting-room?token=eyJhbGci... 로 접속시,
  const searchParams = useSearchParams();
  const router = useRouter();

  //? 뒤 : token=eyJhbGci... -> 'eyJhbGci...'만 추출
  const token = searchParams.get("token");

  useEffect(() => {
    // token이 없을 시, -> 메인페이지로 돌아감
    if (!token) {
      router.push("/");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <LiveKitView token={token} onDisconnected={() => router.push("/")} />
    </div>
  );
}
