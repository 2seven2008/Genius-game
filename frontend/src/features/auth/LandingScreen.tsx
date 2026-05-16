"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Star, Trophy, Zap } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { useAuthStore } from "@/contexts/auth.store";
import { useT } from "@/contexts/i18n";
import toast from "react-hot-toast";

type View = "home" | "register" | "login";

const pageVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: -dir * 24 }),
};

export function LandingScreen() {
  const router = useRouter();
  const { login, register, loginAsGuest, isLoading, user } = useAuthStore();
  const t = useT();
  const [view, setView] = useState<View>("home");
  const [direction, setDirection] = useState(1);
  const [roomCode, setRoomCode] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const goTo = (v: View) => {
    setDirection(v !== "home" ? 1 : -1);
    setView(v);
  };

  const handleGuest = async () => {
    try {
      await loginAsGuest();
      router.push("/home");
    } catch {
      toast.error(t("guestError"));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(regUsername, regEmail, regPassword);
      router.push("/home");
    } catch (err: any) {
      toast.error(err.response?.data?.error || t("registerError"));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      router.push("/home");
    } catch {
      toast.error(t("loginError"));
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error(t("enterCode"));
      return;
    }
    const code = roomCode.trim().toUpperCase();
    if (!user) {
      try {
        await loginAsGuest();
      } catch {
        toast.error(t("guestError"));
        return;
      }
    }
    router.push(`/multiplayer?join=${code}`);
  };

  const features = [
    { icon: Star, text: t("saveProgress") },
    { icon: Trophy, text: t("globalRanking") },
    { icon: Zap, text: t("fullMultiplayer") },
  ];

  return (
    <div className="page">
      <div className="page-inner justify-center py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex justify-center"
        >
          <Logo size="lg" />
        </motion.div>

        {/* Views */}
        <AnimatePresence mode="wait" custom={direction}>
          {view === "home" && (
            <motion.div
              key="home"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4 w-full"
            >
              {/* Features card */}
              <Card variant="default" padding="lg">
                <div className="flex flex-col gap-3 mb-5">
                  {features.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <span className="text-sm text-text-secondary">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => goTo("register")}
                >
                  {t("createAccount")}
                </Button>
                <p className="text-center text-text-muted text-xs mt-3">
                  {t("alreadyHaveAccount")}{" "}
                  <button
                    onClick={() => goTo("login")}
                    className="text-accent font-medium hover:underline"
                  >
                    {t("login")}
                  </button>
                </p>
              </Card>

              <Button
                variant="secondary"
                fullWidth
                size="lg"
                onClick={handleGuest}
                loading={isLoading}
              >
                {t("playGuest")}
              </Button>

              <Divider label={t("enterRoom").toUpperCase()} />

              {/* Room code */}
              <Card variant="flat" padding="md">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                  {t("roomCode")}
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="ABC123"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center font-mono tracking-widest text-lg uppercase"
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleJoinRoom}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    {t("joinRoom")}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {view === "register" && (
            <motion.div
              key="register"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <button
                onClick={() => goTo("home")}
                className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> {t("back")}
              </button>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {t("createAccount")}
              </h2>
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <Input
                  label={t("username")}
                  placeholder="SeuNome123"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
                <Input
                  label={t("email")}
                  type="email"
                  placeholder="seu@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <Input
                  label={t("password")}
                  type="password"
                  placeholder={t("minChars")}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={isLoading}
                  className="mt-1"
                >
                  {t("createAccount")}
                </Button>
              </form>
              <p className="text-center text-text-muted text-xs mt-4">
                {t("alreadyHaveAccount")}{" "}
                <button
                  onClick={() => goTo("login")}
                  className="text-accent font-medium hover:underline"
                >
                  {t("login")}
                </button>
              </p>
            </motion.div>
          )}

          {view === "login" && (
            <motion.div
              key="login"
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <button
                onClick={() => goTo("home")}
                className="flex items-center gap-2 text-text-muted hover:text-text-primary text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> {t("back")}
              </button>
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                {t("login")}
              </h2>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <Input
                  label={t("email")}
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Input
                  label={t("password")}
                  type="password"
                  placeholder="••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={isLoading}
                  className="mt-1"
                >
                  {t("login")}
                </Button>
              </form>
              <p className="text-center text-text-muted text-xs mt-4">
                {t("dontHaveAccount")}{" "}
                <button
                  onClick={() => goTo("register")}
                  className="text-accent font-medium hover:underline"
                >
                  {t("createAccount")}
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
