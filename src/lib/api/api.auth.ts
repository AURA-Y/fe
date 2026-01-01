import { api } from "@/lib/utils";

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
}

export const login = (email: string, password: string) =>
  api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

export const register = (email: string, password: string, nickname: string) =>
  api.post<AuthResponse>("/auth/register", {
    email,
    password,
    nickname,
  });

export const checkNicknameAvailability = (nickname: string) =>
  api.get<{ available: boolean }>(`/auth/check-nickname/${nickname}`);
