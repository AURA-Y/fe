"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export default function AuthCard({ title, description, children, className }: AuthCardProps) {
  return (
    <div className="from-background via-muted/30 to-accent/50 relative flex min-h-screen items-center justify-center bg-linear-to-br p-4">
      {/* 배경 장식 애니메이션 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="bg-primary/5 absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="bg-accent/20 absolute -right-24 -bottom-24 h-96 w-96 rounded-full blur-3xl"
        />
      </div>

      {/* 카드 등장 애니메이션 */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card
          className={cn("border-border/50 bg-background/80 shadow-2xl backdrop-blur-sm", className)}
        >
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl">{title}</CardTitle>
            <p className="text-muted-foreground text-sm">{description}</p>
          </CardHeader>

          <CardContent>{children}</CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
