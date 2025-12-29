"use client";

import AuthCard from "@/components/auth/AuthCard";
import AttendForm from "@/components/lobby/attend/AttendForm";

export default function AttendPage() {
  return (
    <AuthCard title="회의 참여" description="초대받은 회의 링크나 ID를 입력하세요">
      <AttendForm />
    </AuthCard>
  );
}
