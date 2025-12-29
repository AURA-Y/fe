import { getAllRooms, getRoomByRoomId } from "@/lib/api/api.room";
import { GetAllRoomsResponse, GetRoomResponse } from "@/lib/types/room.type";
import { useQuery } from "@tanstack/react-query";

export function useAllReadRooms() {
  return useQuery<GetAllRoomsResponse>({
    queryKey: ["Rooms"],
    queryFn: getAllRooms,
    //인자가 없을때,
    staleTime: 1000 * 60 * 3,
  });
}

export function useSearchRoom(roomId: string) {
  return useQuery<GetRoomResponse>({
    queryKey: ["Room", roomId],
    queryFn: () => getRoomByRoomId(roomId),
    //인자가 존재할 때,
    staleTime: 1000 * 60 * 3,
    enabled: !!roomId,
  });
}

//무한 스크롤 대비한 useQuery

// export function useAllReadRooms() {
//   return useInfiniteQuery<GetAllRoomsResponse>({
//     queryKey: ["Rooms"],
//     queryFn: getAllRooms,
//     initialPageParam: 1,
//     // 다음 페이지 번호를 계산하는 로직
//     getNextPageParam: (lastPage, allPages) => {
//       const nextPage = allPages.length + 1;
//       // 전체 개수(total)를 기반으로 다음 페이지가 있는지 확인
//       return lastPage.rooms.length > 0 ? nextPage : undefined;
//     },
//     staleTime: 1000 * 60 * 3,
//   });
// }
