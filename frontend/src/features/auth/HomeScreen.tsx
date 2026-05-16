"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Gamepad2,
  Swords,
  Trophy,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/contexts/auth.store";
import { useT } from "@/contexts/i18n";
import { disconnectSocket } from "@/services/socket";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ease: [0.16, 1, 0.3, 1], duration: 0.4 },
  },
};

export function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const t = useT();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    router.push("/");
  };

  const menuItems = [
    {
      label: t("singleplayer"),
      icon: Gamepad2,
      href: "/singleplayer",
      accent: "text-violet-400",
    },
    {
      label: t("multiplayer"),
      icon: Swords,
      href: "/multiplayer",
      accent: "text-blue-400",
    },
    {
      label: t("ranking"),
      icon: Trophy,
      href: "/ranking",
      accent: "text-amber-400",
    },
    {
      label: t("settings"),
      icon: Settings,
      href: "/settings",
      accent: "text-text-muted",
    },
  ];

  return (
    <div className="page">
      <div className="page-inner justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex justify-center"
        >
          <Logo size="md" />
        </motion.div>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6"
        >
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Avatar name={user?.username ?? "?"} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-text-primary truncate">
                    {user?.username ?? "Usuário"}
                  </p>
                  {user?.isGuest && (
                    <span className="text-xs text-text-muted bg-surface-3 px-2 py-0.5 rounded-full shrink-0">
                      {t("guest")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">
                    {user?.wins ?? 0} {t("wins")}
                  </span>
                  <span className="text-xs text-text-muted/40">·</span>
                  <span className="text-xs text-text-muted">
                    {user?.matches ?? 0} {t("matches")}
                  </span>
                  <span className="text-xs text-text-muted/40">·</span>
                  <span className="text-xs text-warning font-medium">
                    {user?.highScore ?? 0} pts
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Menu */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2 mb-4"
        >
          {menuItems.map(({ label, icon: Icon, href, accent }) => (
            <motion.button
              key={href}
              variants={item}
              onClick={() => router.push(href)}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-surface-2 border-default hover:bg-surface-3 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-surface-3 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Icon className={`w-4.5 h-4.5 ${accent}`} />
              </div>
              <span className="flex-1 text-left font-medium text-text-primary text-sm">
                {label}
              </span>
              <ChevronRight className="w-4 h-4 text-text-muted/50 group-hover:text-text-muted transition-colors" />
            </motion.button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <Button
            variant="ghost"
            fullWidth
            size="sm"
            onClick={handleLogout}
            icon={<LogOut className="w-3.5 h-3.5" />}
          >
            {t("logout")}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
