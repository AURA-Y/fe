import { useMutation, useQuery } from "@tanstack/react-query";
import * as authApi from "@/lib/api/api.auth";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SignupParams {
  email: string;
  password: string;
  nickname: string;
}

interface LoginParams {
  email: string;
  password: string;
}

export const useSignup = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password, nickname }: SignupParams) =>
      authApi.register(email, password, nickname),

    onSuccess: (response) => {
      const { accessToken, user } = response.data;

      setAuth(user, accessToken);

      toast.success("회원가입이 완료되었습니다! 로그인해주세요.", {
        duration: 3000,
      });
      router.push("/login");
    },

    onError: (error: any) => {
      console.error("회원가입 실패:", error);

      let errorMessage = "회원가입에 실패했습니다.";

      if (error?.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error?.request) {
        errorMessage = "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      toast.error(`${errorMessage}`, {
        duration: 3000,
      });
    },
  });
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: LoginParams) =>
      authApi.login(email, password),

    onSuccess: (response) => {
      const { accessToken, user } = response.data;

      setAuth(user, accessToken);

      toast.success("로그인에 성공했습니다!");
      router.push("/");
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message || "로그인에 실패했습니다.";
      toast.error(`${message}`);
    },
  });
};

export const useNicknameCheck = (nickname: string) => {
  return useQuery({
    queryKey: ["nickname-check", nickname],
    queryFn: () => authApi.checkNicknameAvailability(nickname),
    enabled: !!nickname && nickname.length >= 2,
    staleTime: 30000, // 30초 캐싱
    retry: false, // 실패 시 재시도 안 함
  });
};
