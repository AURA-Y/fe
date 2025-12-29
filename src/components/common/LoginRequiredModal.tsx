"use client";

import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl">로그인이 필요합니다</DialogTitle>
            <DialogDescription className="pt-4 text-center">
              회의에 참여하려면 먼저 로그인해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-6"
            >
              취소
            </Button>
            <Button
              onClick={handleLoginRedirect}
              className="rounded-full bg-blue-600 px-6 hover:bg-blue-700"
            >
              <LogIn className="mr-2 h-4 w-4" />
              로그인
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
