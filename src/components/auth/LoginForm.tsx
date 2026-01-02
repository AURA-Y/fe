"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schema/auth.schema";
import { useLogin } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const { mutateAsync: loginMutate, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    await loginMutate({
      email: data.email,
      password: data.password,
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

      {/* 로그인 버튼 */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white transition-all hover:shadow-lg"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            로그인 중...
          </span>
        ) : (
          "로그인"
        )}
      </Button>

      {/* 회원가입 링크 */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">아직 계정이 없으신가요? </span>
        <Link href="/signup" className="text-primary font-medium transition-colors hover:underline">
          회원가입
        </Link>
      </div>
    </form>
  );
}
