"use client";

import RoomCard from "@/components/common/RoomCard";
import EmptyState from "@/components/common/EmptyState";
import { useAllReadRooms } from "@/hooks/use-read-rooms";

export default function HomePage() {
  const { data: rooms, isLoading, isError } = useAllReadRooms();

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600 dark:border-slate-700 dark:border-t-slate-400"></div>
          <p className="text-slate-600 dark:text-slate-400">회의방을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (isError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            회의방을 불러올 수 없습니다
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            문제가 지속되면 관리자에게 문의해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <p className="text-2xl font-bold">전체 회의방 ({rooms?.total ?? 0})</p>

        {/* 방 목록 그리드 */}
        {rooms?.rooms && rooms.rooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rooms.rooms.map((room) => (
              <RoomCard key={room.roomId} room={room} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="현재 개설된 회의방이 없습니다."
            description="첫 번째 회의를 직접 만들어보세요!"
          />
        )}
      </div>
    </div>
  );
}
