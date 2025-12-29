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
