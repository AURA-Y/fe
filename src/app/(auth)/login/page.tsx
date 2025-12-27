"use client";

import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard title="로그인" description="계정에 로그인하세요">
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
    </AuthCard>
  );
}
