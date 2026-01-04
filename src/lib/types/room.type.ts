interface CreateRoomRequest {
  userName: string;
  roomTitle?: string;
  description?: string;
  maxParticipants?: number;
}

interface CreateRoomResponse {
  roomId: string;
  roomUrl: string;
  roomTitle: string;
  description: string;
  maxParticipants: number;
  userName: string;
  token: string;
  livekitUrl: string;
}

export type { CreateRoomRequest, CreateRoomResponse };

interface Room {
  roomId: string;
  roomTitle: string;
  description: string;
  maxParticipants: number;
  createdBy: string;
  createdAt: string; // 리터럴이 아닌 string 타입으로 지정
  // createdAt: "2025-12-27T08:00:00.000Z";
}

interface GetAllRoomsResponse {
  rooms: Room[];
  total: number;
}

export type { Room, GetAllRoomsResponse };

interface AttendRoomRequest {
  roomId: string;
  userName: string;
}

interface AttendRoomResponse {
  token: string;
  url: string;
}

export type { AttendRoomRequest, AttendRoomResponse };

interface GetRoomResponse {
  roomId: string;
  roomTitle: string;
  description: string;
  maxParticipants: number;
  createdBy: string;
  createdAt: string;
}

export type { GetRoomResponse };

// PostgreSQL Room Management Types
export interface CreateRoomInDBParams {
  roomId: string;
  topic: string;
  description?: string;
  master: string;
  reportId?: string;
  attendees?: string[];
  maxParticipants?: number;
  token?: string;
  livekitUrl?: string;
  upload_File_list?: any[];
}

export interface RoomInfo {
  roomId: string;
  createdAt: string;
  topic: string;
  description?: string;
  attendees: string[];
  maxParticipants: number;
  master: string;
  reportId?: string;
  masterUser?: {
    userId: string;
    email: string;
    nickName: string;
  };
}

export interface UserRoleResponse {
  isMaster: boolean;
  role: "master" | "attendee";
}
