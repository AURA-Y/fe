"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormValues } from "@/lib/schema/auth.schema";
import { useSignup, useNicknameCheck } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Debounce 커스텀 훅 (닉네임 전용)
function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState<string>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function SignupForm() {
  const { mutateAsync: signupMutate, isPending } = useSignup();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const nickname = watch("nickname");
  const debouncedNickname = useDebounce(nickname, 500);

  // useQuery로 닉네임 중복 체크
  const { data: nicknameCheckData, isLoading: isCheckingNickname } = useNicknameCheck(debouncedNickname);

  const onSubmit = async (data: SignupFormValues) => {
    await signupMutate({
      email: data.email,
      password: data.password,
      nickname: data.nickname,
    });
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
          {isCheckingNickname && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
          )}
          {!isCheckingNickname && nicknameCheckData?.data?.available === true && (
            <CheckCircle2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-green-500" />
          )}
          {!isCheckingNickname && nicknameCheckData?.data?.available === false && (
            <XCircle className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-red-500" />
          )}
        </div>
        {errors.nickname && <p className="text-destructive text-xs">{errors.nickname.message}</p>}
        {!errors.nickname && nicknameCheckData?.data?.available === true && (
          <p className="text-xs text-green-500">사용 가능한 닉네임입니다.</p>
        )}
        {!errors.nickname && nicknameCheckData?.data?.available === false && (
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
        disabled={isPending}
        className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white transition-all hover:shadow-lg"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            가입 중...
          </span>
        ) : (
          "회원가입"
        )}
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
