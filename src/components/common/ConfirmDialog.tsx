"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogButton {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  icon?: ReactNode;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  buttons: ConfirmDialogButton[];
}

export default function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  buttons,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl">{title}</DialogTitle>
            <DialogDescription className="pt-4 text-center">
              {description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-2 sm:justify-center">
            {buttons.map((button, index) => (
              <Button
                key={index}
                onClick={button.onClick}
                variant={button.variant}
                className={button.className}
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
