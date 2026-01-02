interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    nickName: string;
    roomReportIdxList?: string[];
  };
}

interface User {
  id: string;
  email: string;
  nickName: string;
  roomReportIdxList?: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  isHydrated: boolean;
  setHydrated: () => void;
}

export type { AuthResponse, User, AuthState };
