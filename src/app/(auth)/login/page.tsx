"use client";

import LoginForm from "@/components/auth/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="from-background via-muted/30 to-accent/50 relative flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/20 absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl" />
      </div>

      {/* 로그인 카드 */}
      <Card className="border-border/50 bg-background/80 relative z-10 w-full max-w-md shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl">로그인</CardTitle>
          <p className="text-muted-foreground text-sm">계정에 로그인하세요</p>
        </CardHeader>

        <CardContent>
          <LoginForm />

          {/* 테스트 계정 안내 */}
          <div className="bg-muted/50 text-muted-foreground mt-6 rounded-lg p-3 text-xs">
            <p className="font-medium">💡 테스트 계정</p>
            <p className="mt-1">
              이메일: <code className="text-foreground">test@example.com</code>
            </p>
            <p>
              비밀번호: <code className="text-foreground">123456</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
