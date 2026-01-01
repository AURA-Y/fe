interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
}

interface User {
  id: string;
  username: string;
  name: string;
  nickname: string;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  isHydrated: boolean;
  setHydrated: () => void;
}

export type { AuthResponse, User, AuthState };
