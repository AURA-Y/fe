import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, generateMockUser } from "@/lib/utils";
import * as authApi from "@/lib/api/api.auth";

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

      login: async (email, password) => {
        const response = await authApi.login(email, password);
        const { accessToken, user } = response.data;

        const fullUser = {
          ...user,
          nickname: user.name,
          email: user.username,
        };

        setAuthHeader(accessToken);
        set({ user: fullUser, accessToken });
      },

      signup: async (email, password, nickname) => {
        const response = await authApi.register(email, password, nickname);
        const { accessToken, user } = response.data;

        const fullUser = {
          ...user,
          nickname: user.name,
          email: user.username,
        };

        setAuthHeader(accessToken);
        set({ user: fullUser, accessToken });
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
        // localStorage에 저장된 유저가 없으면 랜덤 Mock 유저 생성 (클라이언트에서만)
        if (state && !state.user && !state.accessToken) {
          const mockUser = generateMockUser();
          state.user = mockUser;
          state.accessToken = "mock-token";
        } else if (state?.accessToken) {
          setAuthHeader(state.accessToken);
        }
        state?.setHydrated();
      },
    }
  )
);
