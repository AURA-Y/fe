"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LoggedInUserActions from "./header/LoggedInUserActions";
import GuestActions from "./header/GuestActions";
import LogoutConfirmDialog from "./header/LogoutConfirmDialog";

const Header = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutModalOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-slate-100 bg-white px-4 md:px-6 lg:px-8">
        {/* Left Side: Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <a href="/" className="text-2xl font-bold tracking-tight text-blue-600">
            AURA
          </a>
        </div>

        {/* Right Side: Actions & Buttons */}
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden items-center gap-6 xl:flex">
            <Link
              href={"/attend"}
              className="text-[15px] font-medium text-slate-600 hover:text-blue-600"
            >
              Meeting
            </Link>

            {!user && (
              <Link
                href={"/login"}
                className="text-[15px] font-medium text-slate-600 hover:text-blue-600"
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              // 로그인 상태
              <LoggedInUserActions nickname={user.nickName} onLogoutClick={handleLogoutClick} />
            ) : (
              // 비로그인 상태
              <GuestActions />
            )}
          </div>
        </div>
      </header>

      {/* 로그아웃 확인 모달 */}
      <LogoutConfirmDialog
        isOpen={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Header;
