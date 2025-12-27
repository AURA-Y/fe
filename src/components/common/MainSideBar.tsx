"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronsLeft,
  ChevronsRight,
  Home,
  PlusCircle,
  Video,
  LayoutList,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { label: "홈", href: "/", icon: Home },
  { label: "회의 생성", href: "/create", icon: PlusCircle },
  { label: "회의 참여", href: "/attend", icon: Video },
  { label: "지난 회의", href: "/board", icon: LayoutList },
];

const MainSideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: isOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative z-40 hidden h-[calc(100vh-72px)] border-r border-slate-100 bg-white shadow-sm lg:block"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-6 -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-blue-600 focus:outline-none"
      >
        {isOpen ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
      </button>

      {/* Menu List */}
      <div className="flex h-full flex-col justify-between py-6">
        <ul className="space-y-2 px-3">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon size={20} className="shrink-0" />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom Section (Settings etc) */}
        <div className="space-y-2 px-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
            <Settings size={20} className="shrink-0" />
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap"
              >
                설정
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default MainSideBar;
