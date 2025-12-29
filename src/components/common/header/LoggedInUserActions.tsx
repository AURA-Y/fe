"use client";

import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoggedInUserActionsProps {
  nickname: string;
  onLogoutClick: () => void;
}

export default function LoggedInUserActions({ nickname, onLogoutClick }: LoggedInUserActionsProps) {
  return (
    <>
      <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-4 py-2 md:flex">
        <User className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-700">{nickname}</span>
      </div>
      <Button
        onClick={onLogoutClick}
        variant="outline"
        className="h-auto rounded-full border-blue-600 px-4 py-2 text-[15px] font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-700"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </>
  );
}
