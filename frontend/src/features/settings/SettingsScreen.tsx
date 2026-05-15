"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Sun,
  Moon,
  Monitor,
  Ghost,
  TreePine,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useThemeStore, Theme, Language } from "@/contexts/theme.store";
import { useT } from "@/contexts/i18n";
import toast from "react-hot-toast";

const THEMES: { value: Theme; icon: React.ReactNode; labelKey: string }[] = [
  { value: "dark", icon: <Moon className="w-4 h-4" />, labelKey: "darkTheme" },
  { value: "light", icon: <Sun className="w-4 h-4" />, labelKey: "lightTheme" },
  {
    value: "system",
    icon: <Monitor className="w-4 h-4" />,
    labelKey: "systemTheme",
  },
  {
    value: "halloween",
    icon: <Ghost className="w-4 h-4" />,
    labelKey: "halloweenTheme",
  },
  {
    value: "christmas",
    icon: <TreePine className="w-4 h-4" />,
    labelKey: "christmasTheme",
  },
];

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "pt-BR", label: "Português (BR)", flag: "🇧🇷" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
];

const THEME_ACCENT: Record<Theme, string> = {
  dark: "bg-slate-700",
  light: "bg-slate-200",
  system: "bg-gradient-to-r from-slate-700 to-slate-200",
  halloween: "bg-orange-500",
  christmas: "bg-red-600",
};

export function SettingsScreen() {
  const router = useRouter();
  const { theme, language, setTheme, setLanguage } = useThemeStore();
  const t = useT();

  const handleClearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
      toast.success(t("cacheCleaned"));
    }
  };

  return (
    <div className="page">
      <div className="page-inner pt-12 pb-8">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push("/home")}
            className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-xl text-text-primary">
            {t("settings")}
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Theme */}
          <section>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              {t("theme")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map(({ value, icon, labelKey }) => {
                const isActive = theme === value;
                return (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all ${
                      isActive
                        ? "bg-accent/8 border-accent/40 text-text-primary"
                        : "bg-surface-2 border-[rgb(var(--border)/0.07)] text-text-secondary hover:border-[rgb(var(--border)/0.14)]"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${THEME_ACCENT[value]}`}
                    >
                      <span
                        className={isActive ? "text-white" : "text-white/80"}
                      >
                        {icon}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-left">
                      {(t as any)(labelKey)}
                    </span>
                    {isActive && (
                      <Check className="w-3.5 h-3.5 text-accent ml-auto shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Language */}
          <section>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              {t("language")}
            </p>
            <Card variant="default" padding="none">
              {LANGUAGES.map(({ value, label, flag }, i) => {
                const isActive = language === value;
                return (
                  <button
                    key={value}
                    onClick={() => setLanguage(value)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-3 ${
                      i < LANGUAGES.length - 1
                        ? "border-b border-[rgb(var(--border)/0.07)]"
                        : ""
                    }`}
                  >
                    <span className="text-xl">{flag}</span>
                    <span className="flex-1 text-sm font-medium text-text-primary text-left">
                      {label}
                    </span>
                    {isActive && (
                      <Check className="w-4 h-4 text-accent shrink-0" />
                    )}
                  </button>
                );
              })}
            </Card>
          </section>

          {/* Misc */}
          <section>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Avançado
            </p>
            <Card variant="default" padding="none">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-[rgb(var(--border)/0.07)]">
                <span className="text-sm text-text-secondary">
                  {t("appVersion")}
                </span>
                <span className="text-sm text-text-muted font-mono">
                  v1.0.0
                </span>
              </div>
              <button
                onClick={handleClearCache}
                className="w-full flex items-center justify-between px-4 py-3.5 text-danger hover:bg-danger/5 transition-colors text-left"
              >
                <span className="text-sm font-medium">{t("clearCache")}</span>
              </button>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
