import { getRoomInfoFromDB } from "@/lib/api/api.room";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth.store";

export function useRoomInfo(roomId: string) {
  return useQuery({
    queryKey: ["RoomInfo", roomId],
    queryFn: () => getRoomInfoFromDB(roomId),
    staleTime: 1000 * 60 * 3,
    enabled: !!roomId,
  });
}

export function useIsMaster(roomId: string) {
  const { user } = useAuthStore();
  const { data: roomInfo, isLoading } = useRoomInfo(roomId);

  const isMaster = user && roomInfo ? roomInfo.master === user.id : false;

  return {
    isMaster,
    isLoading,
    roomInfo,
  };
}
