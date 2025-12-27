"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schema/auth.schema";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    const success = login(data.email, data.password);

    if (success) {
      toast.success("로그인 성공!");
      router.push("/");
    } else {
      toast.error("이메일 또는 비밀번호가 잘못되었습니다.");
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

      {/* 로그인 버튼 */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white transition-all hover:shadow-lg"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </Button>

      {/* 회원가입 링크 */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">계정이 없으신가요? </span>
        <Link href="/signup" className="text-primary font-medium transition-colors hover:underline">
          회원가입
        </Link>
      </div>
    </form>
  );
}
