import { livekitApi, api } from "../utils";

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

// PostgreSQL Room Management APIs
interface CreateRoomInDBParams {
  roomId: string;
  topic: string;
  description?: string;
  master: string;
  attendees?: string[];
  maxParticipants?: number;
  token?: string;
  livekitUrl?: string;
  upload_File_list?: any[];
}

interface RoomInfo {
  roomId: string;
  createdAt: string;
  topic: string;
  description?: string;
  attendees: string[];
  maxParticipants: number;
  master: string;
  masterUser?: {
    userId: string;
    email: string;
    nickName: string;
  };
}

const createRoomInDB = async (params: CreateRoomInDBParams): Promise<RoomInfo> => {
  const { data } = await api.post<RoomInfo>("/restapi/rooms", params);
  return data;
};

const getAllRoomsFromDB = async (): Promise<RoomInfo[]> => {
  const { data } = await api.get<RoomInfo[]>("/restapi/rooms");
  return data;
};

const getRoomInfoFromDB = async (roomId: string): Promise<RoomInfo> => {
  const { data } = await api.get<RoomInfo>(`/restapi/rooms/${roomId}`);
  return data;
};

const deleteRoomFromDB = async (roomId: string): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/restapi/rooms/${roomId}`);
  return data;
};

const joinRoomInDB = async (roomId: string): Promise<RoomInfo> => {
  const { data } = await api.post<RoomInfo>(`/restapi/rooms/${roomId}/join`);
  return data;
};

const leaveRoomInDB = async (roomId: string): Promise<RoomInfo> => {
  const { data } = await api.post<RoomInfo>(`/restapi/rooms/${roomId}/leave`);
  return data;
};

interface UserRoleResponse {
  isMaster: boolean;
  role: 'master' | 'attendee';
}

const checkUserRole = async (roomId: string): Promise<UserRoleResponse> => {
  const { data } = await api.get<UserRoleResponse>(`/restapi/rooms/${roomId}/role`);
  return data;
};

export {
  createRoom,
  getAllRooms,
  attendRoom,
  getRoomByRoomId,
  createRoomInDB,
  getAllRoomsFromDB,
  getRoomInfoFromDB,
  deleteRoomFromDB,
  joinRoomInDB,
  leaveRoomInDB,
  checkUserRole,
};