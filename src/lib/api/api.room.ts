import { livekitApi } from "../utils";

import {
  AttendRoomRequest,
  AttendRoomResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  GetAllRoomsResponse,
  GetRoomResponse,
} from "../types/room.type";

// 방 생성 api - POST /room/create
const createRoom = async (params: CreateRoomRequest): Promise<CreateRoomResponse> => {
  const { data } = await livekitApi.post<CreateRoomResponse>("/api/room/create", params);
  return data;
};

// 기존 방 입장을 위한 LiveKit JWT 토큰 발급 api - POST /room/join
//
const attendRoom = async (params: AttendRoomRequest): Promise<AttendRoomResponse> => {
  const { data } = await livekitApi.post<AttendRoomResponse>("/api/room/join", params);
  return data;
};

// 현재 생성된 모든 방의 목록 반환 api - GET /rooms
const getAllRooms = async (): Promise<GetAllRoomsResponse> => {
  const { data } = await livekitApi.get<GetAllRoomsResponse>("/api/rooms");
  return data;
};

// 회의 방 메타데이터 조회 api - GET /room/:roomId
const getRoomByRoomId = async (roomId: string): Promise<GetRoomResponse> => {
  const { data } = await livekitApi.get<GetRoomResponse>(`/api/room/${roomId}`);
  return data;
};

export { createRoom, getAllRooms, attendRoom, getRoomByRoomId };
