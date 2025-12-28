import { api } from "@/lib/utils";

// 기존 방 입장을 위한 LiveKit JWT 토큰을 발급 api

// 방 생성 api

const createRoom = async (user: string) => {
  const { data } = await api.post<{ roomId: string; roomUrl: string; userName: string }>(
    "/api/room/create",
    {
      userName: user,
    }
  );
  return data;
};

// 특정 방의 메타데이터를 조회 api

// 현재 생성된 모든 방의 목록을 반환 api

export { createRoom };
