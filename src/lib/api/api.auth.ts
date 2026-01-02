import { api } from "@/lib/utils";
import { AuthResponse } from "../types/auth.type";

export const login = (email: string, password: string) =>
  api.post<AuthResponse>("/restapi/auth/login", {
    email,
    password,
  });

export const register = (email: string, password: string, nickname: string) =>
  api.post<AuthResponse>("/restapi/auth/register", {
    email,
    password,
    nickname,
  });

export const checkNicknameAvailability = (nickname: string) =>
  api.get<{ available: boolean }>(`/restapi/auth/check-nickname/${nickname}`);
