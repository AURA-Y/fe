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
