"use client";

import SignupForm from "@/components/auth/SignupForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="from-background via-muted/30 to-accent/50 relative flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-accent/20 absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl" />
      </div>

      {/* 회원가입 카드 */}
      <Card className="border-border/50 bg-background/80 relative z-10 w-full max-w-md shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl">회원가입</CardTitle>
          <p className="text-muted-foreground text-sm">새로운 계정을 생성하세요</p>
        </CardHeader>

        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  );
}
