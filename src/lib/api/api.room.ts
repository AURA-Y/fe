import { api } from "@/lib/utils";
import {
  GetAllRoomsResponse,
  GetRoomResponse,
  CreateRoomRequest,
  CreateRoomResponse,
  AttendRoomRequest,
  AttendRoomResponse,
} from "@/lib/types/room.type";

export const getAllRooms = async (): Promise<GetAllRoomsResponse> => {
  const response = await api.get("/api/rooms");
  console.log("getAllRooms Response:", response.data); // Debugging
  return response.data;
};

export const getRoomByRoomId = async (roomId: string): Promise<GetRoomResponse> => {
  const response = await api.get(`/api/room/${roomId}`);
  return response.data;
};

export const createRoom = async (data: CreateRoomRequest): Promise<CreateRoomResponse> => {
  const response = await api.post("/api/room/create", data);
  return response.data;
};

export const joinRoom = async (data: AttendRoomRequest): Promise<AttendRoomResponse> => {
  const response = await api.post("/api/token", data);
  return response.data;
};
