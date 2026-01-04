import { livekitApi, api } from "../utils";

import {
  AttendRoomRequest,
  AttendRoomResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  GetAllRoomsResponse,
  GetRoomResponse,
  CreateRoomInDBParams,
  RoomInfo,
  UserRoleResponse,
} from "../types/room.type";

// ============================================================================
// LiveKit API (실시간 화상회의)
// ============================================================================

/**
 * 새로운 LiveKit 회의방 생성
 * @endpoint POST /api/room/create
 */
const createRoom = async (params: CreateRoomRequest): Promise<CreateRoomResponse> => {
  const { data } = await livekitApi.post<CreateRoomResponse>("/api/room/create", params);
  return data;
};

/**
 * 기존 LiveKit 회의방 입장 (JWT 토큰 발급)
 * @endpoint POST /api/room/join
 */
const attendRoom = async (params: AttendRoomRequest): Promise<AttendRoomResponse> => {
  const { data } = await livekitApi.post<AttendRoomResponse>("/api/room/join", params);
  return data;
};

/**
 * 특정 LiveKit 회의방 메타데이터 조회
 * @endpoint GET /api/room/:roomId
 */
const getRoomByRoomId = async (roomId: string): Promise<GetRoomResponse> => {
  const { data } = await livekitApi.get<GetRoomResponse>(`/api/room/${roomId}`);
  return data;
};

/**
 * 모든 LiveKit 회의방 목록 조회
 * @endpoint GET /api/rooms
 */
const getAllRooms = async (): Promise<GetAllRoomsResponse> => {
  const { data } = await livekitApi.get<GetAllRoomsResponse>("/api/rooms");
  return data;
};

// ============================================================================
// PostgreSQL Room Management (회의방 정보 영속화)
// ============================================================================

/**
 * PostgreSQL DB에 회의방 정보 저장
 * @endpoint POST /restapi/rooms
 */
const createRoomInDB = async (params: CreateRoomInDBParams): Promise<RoomInfo> => {
  const { data } = await api.post<RoomInfo>("/restapi/rooms", params);
  return data;
};

/**
 * PostgreSQL DB에서 회의방에 참여자 등록
 * @endpoint POST /restapi/rooms/:roomId/join
 */
const joinRoomInDB = async (roomId: string): Promise<RoomInfo> => {
  const { data } = await api.post<RoomInfo>(`/restapi/rooms/${roomId}/join`);
  return data;
};

/**
 * PostgreSQL DB에서 특정 회의방 정보 조회
 * @endpoint GET /restapi/rooms/:roomId
 */
const getRoomInfoFromDB = async (roomId: string): Promise<RoomInfo> => {
  const { data } = await api.get<RoomInfo>(`/restapi/rooms/${roomId}`);
  return data;
};

/**
 * PostgreSQL DB에서 모든 회의방 목록 조회
 * @endpoint GET /restapi/rooms
 */
const getAllRoomsFromDB = async (): Promise<RoomInfo[]> => {
  const { data } = await api.get<RoomInfo[]>("/restapi/rooms");
  return data;
};

/**
 * PostgreSQL DB에서 현재 사용자의 회의방 역할 확인
 * @endpoint GET /restapi/rooms/:roomId/role
 */
const checkUserRole = async (roomId: string): Promise<UserRoleResponse> => {
  const { data } = await api.get<UserRoleResponse>(`/restapi/rooms/${roomId}/role`);
  return data;
};

/**
 * PostgreSQL DB에서 회의방 정보 삭제
 * @endpoint DELETE /restapi/rooms/:roomId
 */
const deleteRoomFromDB = async (roomId: string): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`/restapi/rooms/${roomId}`);
  return data;
};

// ============================================================================
// Exports
// ============================================================================

export {
  // LiveKit API
  createRoom,
  attendRoom,
  getRoomByRoomId,
  getAllRooms,
  // PostgreSQL API
  createRoomInDB,
  joinRoomInDB,
  getRoomInfoFromDB,
  getAllRoomsFromDB,
  checkUserRole,
  deleteRoomFromDB,
};
