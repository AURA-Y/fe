"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GuestActions() {
  return (
    <>
      <Button
        variant="outline"
        asChild
        className="hidden h-auto rounded-full border-blue-600 px-5 py-2 text-[15px] font-bold text-blue-600 hover:bg-blue-50 hover:text-blue-600 md:flex"
      >
        <Link href={"/login"}>Login</Link>
      </Button>
      <Button
        asChild
        className="h-auto rounded-full bg-blue-600 px-5 py-2 text-[15px] font-bold text-white hover:bg-blue-700"
      >
        <Link href={"/signup"}>Sign Up</Link>
      </Button>
    </>
  );
}
