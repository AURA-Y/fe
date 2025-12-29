"use client";

import AuthCard from "@/components/auth/AuthCard";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthCard title="회원가입" description="새로운 계정을 생성하세요">
      <SignupForm />
    </AuthCard>
  );
}
