"use client";

import RoomCard from "@/components/common/RoomCard";
import { useAllReadRooms } from "@/hooks/use-read-rooms";

export default function HomePage() {
  const { data: rooms, isLoading, isError } = useAllReadRooms();

  if (isLoading) return <div>방을 불러오는 중입니다.</div>;
  if (isError) return <div>404</div>;

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Header Section */}
      <div className="mx-auto max-w-5xl space-y-8">
        <p className="text-2xl font-bold">전체 회의방 ({rooms?.total})</p>
        {/* 검색바 적용 */}

        {/* 방 목록 그리드 */}
        {rooms?.rooms && rooms.rooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rooms.rooms.map((room) => (
              <RoomCard key={room.roomId} room={room} />
            ))}
          </div>
        ) : (
          // 회의방이 없을 때,
          <div className="flex h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50">
            <p className="text-slate-500">현재 개설된 회의방이 없습니다.</p>
            <p className="text-sm text-slate-400">첫 번째 회의를 직접 만들어보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
