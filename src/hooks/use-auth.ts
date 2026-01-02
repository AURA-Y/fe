import { useMutation, useQuery } from "@tanstack/react-query";
import { register, login, checkNicknameAvailability } from "@/lib/api/api.auth";
import { useAuthStore } from "@/lib/store/auth.store";
import { errorHandler } from "@/lib/utils";
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
      register(email, password, nickname),

    onSuccess: (response) => {
      const { accessToken, user } = response.data;

      setAuth(user, accessToken);

      toast.success("회원가입이 완료되었습니다! 로그인해주세요.", {
        duration: 3000,
      });
      router.push("/login");
    },

    onError: (error: unknown) => {
      errorHandler(error);
    },
  });
};

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: LoginParams) =>
      login(email, password),

    onSuccess: (response) => {
      const { accessToken, user } = response.data;

      setAuth(user, accessToken);

      toast.success("로그인에 성공했습니다!");
      router.push("/");
    },

    onError: (error: unknown) => {
      errorHandler(error);
    },
  });
};

export const useNicknameCheck = (nickname: string) => {
  return useQuery({
    queryKey: ["nickname-check", nickname],
    queryFn: () => checkNicknameAvailability(nickname),
    enabled: !!nickname && nickname.length >= 2,
    staleTime: 30000, // 30초 캐싱
    retry: false, // 실패 시 재시도 안 함
  });
};
