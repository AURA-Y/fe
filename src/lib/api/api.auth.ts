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
  api.post<AuthResponse>("/api/auth/login", {
    username: email,
    password,
  });

export const register = (email: string, password: string, nickname: string) =>
  api.post<AuthResponse>("/api/auth/register", {
    username: email,
    password,
    name: nickname,
  });
