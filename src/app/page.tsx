"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();

  // 방 생성용
  const [createUserName, setCreateUserName] = useState("");

  // 방 입장용
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinUserName, setJoinUserName] = useState("");

  // 방 생성
  const handleCreate = async () => {
    if (!createUserName.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }

    try {
      const data = await createRoom(createUserName.trim());
      // 바로 방으로 이동 (userName 포함)
      router.push(`/room/${data.roomId}?userName=${encodeURIComponent(createUserName.trim())}`);
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert("방 생성에 실패했습니다.");
    }
  };

  // 방 입장
  const handleJoin = () => {
    if (!joinRoomId.trim()) {
      alert("방 ID를 입력해주세요!");
      return;
    }
    if (!joinUserName.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }

    router.push(`/room/${joinRoomId.trim()}?userName=${encodeURIComponent(joinUserName.trim())}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/10 p-8 shadow-xl backdrop-blur-md">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">AURA</h1>
          <p className="mt-2 text-sm text-gray-300">화상회의 플랫폼</p>
        </div>

        {/* 방 생성 섹션 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">🎥 새 방 만들기</h2>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={createUserName}
            onChange={(e) => setCreateUserName(e.target.value)}
            className="w-full rounded-lg bg-white/20 px-4 py-3 text-white placeholder-gray-300 ring-2 ring-white/30 outline-none focus:ring-blue-400"
          />
          <button
            onClick={handleCreate}
            className="w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            방 생성하기
          </button>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/30"></div>
          <span className="text-sm text-gray-300">또는</span>
          <div className="h-px flex-1 bg-white/30"></div>
        </div>

        {/* 방 입장 섹션 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">🚪 기존 방 참여하기</h2>
          <input
            type="text"
            placeholder="방 ID (예: room-a1b2c3d4)"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="w-full rounded-lg bg-white/20 px-4 py-3 text-white placeholder-gray-300 ring-2 ring-white/30 outline-none focus:ring-green-400"
          />
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={joinUserName}
            onChange={(e) => setJoinUserName(e.target.value)}
            className="w-full rounded-lg bg-white/20 px-4 py-3 text-white placeholder-gray-300 ring-2 ring-white/30 outline-none focus:ring-green-400"
          />
          <button
            onClick={handleJoin}
            className="w-full rounded-lg bg-green-500 px-4 py-3 font-semibold text-white transition hover:bg-green-600"
          >
            방 참여하기
          </button>
        </div>
      </div>
    </div>
  );
}

// 1. 방생성 -> 프론트 : 입력한 이름 -> API : 이름 받아오는 -> 백엔드 : 이름 받는 api + 기존 방생성 api
// 2. 방입장 -> 프론트 : 입장하려는 새끼의 닉네임 입력 -> Api 이름 받아오는 -> 방입장
