"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginRequiredModal({ isOpen, onOpenChange }: LoginRequiredModalProps) {
  const router = useRouter();

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="로그인이 필요합니다"
      description="회의에 참여하려면 먼저 로그인해주세요."
      buttons={[
        {
          label: "취소",
          onClick: () => onOpenChange(false),
          variant: "outline",
          className: "rounded-full px-6",
        },
        {
          label: "로그인",
          onClick: handleLoginRedirect,
          className: "rounded-full bg-blue-600 px-6 hover:bg-blue-700 text-white",
          icon: <LogIn className="mr-2 h-4 w-4" />,
        },
      ]}
    />
  );
}
