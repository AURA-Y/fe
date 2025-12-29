export interface RtpCapabilities {
  codecs?: any[];
  headerExtensions?: any[];
  fecMechanisms?: any[];
}

export interface IceParameters {
  usernameFragment: string;
  password: string;
  iceLite?: boolean;
}

export interface IceCandidate {
  foundation: string;
  priority: number;
  ip: string;
  protocol: "udp" | "tcp";
  port: number;
  type: "host" | "srflx" | "prflx" | "relay";
  tcpType?: "active" | "passive" | "so";
}

export interface DtlsParameters {
  role?: "auto" | "client" | "server";
  fingerprints: DtlsFingerprint[];
}

export interface DtlsFingerprint {
  algorithm: string;
  value: string;
}

export interface TransportOptions {
  id: string;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
}

// --- API DTOs ---

// POST /api/room/create
export interface CreateRoomRequest {
  userName: string;
  roomTitle?: string;
  description?: string;
  maxParticipants?: number;
}

export interface CreateRoomResponse {
  roomId: string;
  roomUrl: string;
  roomTitle: string;
  description: string;
  maxParticipants: number;
  userName: string;
  token: string; // LiveKit or App token
  livekitUrl?: string; // Optional depending on backend
}

// GET /media/router/:roomId
export interface GetRouterCapabilitiesResponse {
  roomId: string;
  rtpCapabilities: RtpCapabilities;
}

// POST /media/transport
export interface CreateTransportRequest {
  roomId: string;
  // Backend code didn't show direction, but usually needed for differentiating send/recv.
  // We'll pass it if the backend supports it, or just ignore if not.
  // Ideally, the backend should accept consuming: boolean or direction: 'send' | 'recv'
  // For now, adhering strictly to the provided snippets which only showed roomId in DTO (inferred).
  // BUT, usually we need to distinguish. I will add it as optional or app-level handling.
  direction?: "send" | "recv";
}
