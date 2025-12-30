"use client";

import { useEffect } from "react";
import LiveKitView from "@/components/room/LiveKitView";
import { useRouter, useSearchParams } from "next/navigation";

export default function RoomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  useEffect(() => {
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
