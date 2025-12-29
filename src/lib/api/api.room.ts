import { api } from "@/lib/utils";
import {
  AttendRoomRequest,
  AttendRoomResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  GetAllRoomsResponse,
  GetRoomResponse,
} from "../types/room.type";

// 방 생성 api
const createRoom = async (params: CreateRoomRequest): Promise<CreateRoomResponse> => {
  const { data } = await api.post<CreateRoomResponse>("/api/room/create", params);

  return data;
};

// 기존 방 입장을 위한 LiveKit JWT 토큰을 발급 api
const attendRoom = async (params: AttendRoomRequest): Promise<AttendRoomResponse> => {
  const { data } = await api.post<AttendRoomResponse>("/api/token", params);
  return data;
};

// 현재 생성된 모든 방의 목록을 반환 api
const getAllRooms = async (): Promise<GetAllRoomsResponse> => {
  const { data } = await api.get<GetAllRoomsResponse>("/api/rooms");
  return data;
};

// 회의 방 검색 api

const getRoomByRoomId = async (roomId: string): Promise<GetRoomResponse> => {
  const { data } = await api.get<GetRoomResponse>(`/api/room/${roomId}`);
  return data;
};

export { createRoom, getAllRooms, attendRoom, getRoomByRoomId };
