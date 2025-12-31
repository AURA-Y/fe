"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormValues } from "@/lib/schema/auth.schema";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { checkNicknameAvailability } from "@/lib/api/api.auth";

export default function SignupForm() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const [nicknameStatus, setNicknameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
  }>({ checking: false, available: null });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const nickname = watch("nickname");

  // 닉네임 중복 체크 (debounce)
  useEffect(() => {
    if (!nickname || nickname.length < 2) {
      setNicknameStatus({ checking: false, available: null });
      return;
    }

    setNicknameStatus({ checking: true, available: null });

    const timer = setTimeout(async () => {
      try {
        const response = await checkNicknameAvailability(nickname);
        setNicknameStatus({ checking: false, available: response.data.available });
      } catch (error) {
        setNicknameStatus({ checking: false, available: null });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [nickname]);

  const onSubmit = async (data: SignupFormValues) => {
    console.log("🚀 회원가입 시도:", { email: data.email, nickname: data.nickname });

    try {
      const result = await signup(data.email, data.password, data.nickname);
      console.log("✅ 회원가입 성공:", result);
      toast.success("✅ 회원가입이 완료되었습니다! 로그인해주세요.", {
        duration: 5000,
      });
      router.push("/login");
    } catch (error: any) {
      console.error("❌ 회원가입 실패:", error);

      let errorMessage = "회원가입에 실패했습니다.";

      if (error?.response) {
        console.error("❌ 서버 응답 에러:", error.response.data);
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error?.request) {
        console.error("❌ 요청 에러 (서버 응답 없음):", error.request);
        errorMessage = "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.";
      } else {
        console.error("❌ 기타 에러:", error.message);
        errorMessage = error.message || errorMessage;
      }

      toast.error(`❌ ${errorMessage}`, {
        duration: 7000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* 이메일 */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-foreground text-sm font-medium">
          이메일
        </label>
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="email"
            {...register("email")}
            type="email"
            placeholder="example@email.com"
            className="focus:ring-primary/20 pl-10 transition-all focus:ring-2"
          />
        </div>
        {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
      </div>

      {/* 닉네임 */}
      <div className="space-y-2">
        <label htmlFor="nickname" className="text-foreground text-sm font-medium">
          닉네임
        </label>
        <div className="relative">
          <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="nickname"
            {...register("nickname")}
            placeholder="사용할 닉네임을 입력하세요"
            className="focus:ring-primary/20 pl-10 pr-10 transition-all focus:ring-2"
          />
          {nicknameStatus.checking && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
          {!nicknameStatus.checking && nicknameStatus.available === true && (
            <CheckCircle2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-green-500" />
          )}
          {!nicknameStatus.checking && nicknameStatus.available === false && (
            <XCircle className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-red-500" />
          )}
        </div>
        {errors.nickname && <p className="text-destructive text-xs">{errors.nickname.message}</p>}
        {!errors.nickname && nicknameStatus.available === true && (
          <p className="text-xs text-green-500">사용 가능한 닉네임입니다.</p>
        )}
        {!errors.nickname && nicknameStatus.available === false && (
          <p className="text-xs text-red-500">이미 사용 중인 닉네임입니다.</p>
        )}
      </div>

      {/* 비밀번호 */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-foreground text-sm font-medium">
          비밀번호
        </label>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="password"
            {...register("password")}
            type="password"
            placeholder="********"
            className="focus:ring-primary/20 pl-10 transition-all focus:ring-2"
          />
        </div>
        {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
      </div>

      {/* 비밀번호 확인 */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-foreground text-sm font-medium">
          비밀번호 확인
        </label>
        <div className="relative">
          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="confirmPassword"
            {...register("confirmPassword")}
            type="password"
            placeholder="********"
            className="focus:ring-primary/20 pl-10 transition-all focus:ring-2"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* 회원가입 버튼 */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white transition-all hover:shadow-lg"
      >
        {isSubmitting ? "가입 중..." : "회원가입"}
      </Button>

      {/* 로그인 링크 */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
        <Link href="/login" className="text-primary font-medium transition-colors hover:underline">
          로그인
        </Link>
      </div>
    </form>
  );
}
