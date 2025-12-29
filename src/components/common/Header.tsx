"use client";

import { Search, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

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
              <>
                <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-4 py-2 md:flex">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">{user.nickname}</span>
                </div>
                <Button
                  onClick={handleLogoutClick}
                  variant="outline"
                  className="h-auto rounded-full border-blue-600 px-4 py-2 text-[15px] font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              // 비로그인 상태
              <>
                <Button
                  variant="outline"
                  className="hidden h-auto rounded-full border-blue-600 px-5 py-2 text-[15px] font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-600 md:block"
                >
                  <Link href={"/login"}>Login</Link>
                </Button>
                <Button className="h-auto rounded-full bg-blue-600 px-5 py-2 text-[15px] font-bold text-white hover:bg-blue-700">
                  <Link href={"/signup"}>Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 로그아웃 확인 모달 */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle className="text-center text-xl">로그아웃 확인</DialogTitle>
              <DialogDescription className="pt-4 text-center">
                정말 로그아웃하시겠습니까?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex gap-2 sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex items-center justify-center rounded-full px-6 font-bold"
              >
                취소
              </Button>
              <Button
                onClick={handleLogoutConfirm}
                className="flex items-center justify-center rounded-full bg-blue-600 px-6 font-bold hover:bg-blue-700"
              >
                로그아웃
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
