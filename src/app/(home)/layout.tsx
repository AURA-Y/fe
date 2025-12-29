"use client";

import Header from "@/components/common/Header";
import MainSideBar from "@/components/common/MainSideBar";
import LoginRequiredModal from "@/components/common/LoginRequiredModal";
import { useAuthStore } from "@/lib/store/auth.store";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 이미 로그인 페이지나 회원가입 페이지 등에 있다면 모달 띄우지 않음
    if (!user) {
      setShowLoginModal(true);
    }
  }, [user, pathname]);

  const handleModalOpenChange = (open: boolean) => {
    setShowLoginModal(open);
    if (!open) {
      // 모달이 닫힐 때 (취소, 배경 클릭 등) 로그인 페이지로 이동
      router.push("/login");
    }
  };

  return (
    <div>
      <Header />
      <div className="flex">
        <MainSideBar />
        <main className="flex-1">{children}</main>
      </div>

      <LoginRequiredModal isOpen={showLoginModal} onOpenChange={handleModalOpenChange} />
    </div>
  );
}
