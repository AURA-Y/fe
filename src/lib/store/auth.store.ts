import { create } from "zustand";
import { persist } from "zustand/middleware";
// 사용자 타입 정의
interface User {
  id: string;
  email: string;
  nickname: string;
}
interface AuthState {
  // 상태
  user: User | null;
  users: User[]; // 목데이터 (가상 DB)

  // 액션
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string, nickname: string) => boolean;
  logout: () => void;
  isHydrated: boolean;
  setHydrated: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      users: [
        // 목데이터 (테스트용)
        { id: "1", email: "test@example.com", nickname: "테스트유저" },
        { id: "2", email: "test1@example.com", nickname: "테스트" },
      ],

      // 로그인 로직
      login: (email, password) => {
        const { users } = get();
        const foundUser = users.find((u) => u.email === email);

        if (foundUser && password === "123456") {
          // 간단한 비밀번호 체크
          set({ user: foundUser });
          return true;
        }
        return false;
      },

      // 회원가입 로직
      signup: (email, password, nickname) => {
        const { users } = get();

        // 이메일 중복 체크
        if (users.find((u) => u.email === email)) {
          return false;
        }

        const newUser: User = {
          id: Date.now().toString(),
          email,
          nickname,
        };

        set({
          users: [...users, newUser],
          user: newUser, // 회원가입 후 자동 로그인
        });
        return true;
      },

      // 로그아웃
      logout: () => set({ user: null }),

      // Hydration 상태 관리
      isHydrated: false,
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage", // localStorage 키
      partialize: (state) => ({ user: state.user }), // user만 localStorage에 저장
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
