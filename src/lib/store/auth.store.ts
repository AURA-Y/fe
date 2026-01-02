import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/utils";
import { AuthState } from "../types/auth.type";
import { login, register, checkNicknameAvailability } from "@/lib/api/api.auth";

const AUTH_STORAGE_KEY = "auth-storage-mock";

const setAuthHeader = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken || null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user: User, accessToken: string) => {
        setAuthHeader(accessToken);
        set({ user, accessToken });
      },

      logout: () => {
        setAuthHeader(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        set({ user: null, accessToken: null });
      },

      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        // localStorage에서 토큰 복원 시 Authorization 헤더 설정
        if (state?.accessToken) {
          setAuthHeader(state.accessToken);
        }
        state?.setHydrated();
      },
    }
  )
);
