"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormValues } from "@/lib/schema/auth.schema";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User } from "lucide-react";
import Link from "next/link";

export default function SignupForm() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormValues) => {
    const success = signup(data.email, data.password, data.nickname);

    if (success) {
      toast.success("회원가입 성공! 로그인해주세요.");
      router.push("/login");
    } else {
      toast.error("이미 존재하는 이메일입니다.");
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
            placeholder="사용할 닉네임"
            className="focus:ring-primary/20 pl-10 transition-all focus:ring-2"
          />
        </div>
        {errors.nickname && <p className="text-destructive text-xs">{errors.nickname.message}</p>}
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
            placeholder="••••••••"
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
            placeholder="••••••••"
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
