"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GeniusBoard } from "@/components/game/GeniusBoard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSingleplayer } from "@/hooks/useSingleplayer";
import { useT } from "@/contexts/i18n";

export function SingleplayerScreen() {
  const router = useRouter();
  const { state, startGame, handleColorPress, quit } = useSingleplayer();
  const { phase, score, level, activeColor, highScore } = state;
  const t = useT();

  const isPlaying = phase !== "idle" && phase !== "gameover";
  const isShaking = phase === "wrong";
  const inputDisabled = phase !== "input";

  const handleQuit = async () => {
    await quit();
    router.push("/home");
  };

  return (
    <div className="page">
      <div className="page-inner pt-10 pb-8 justify-between">
        {/* Top: score area */}
        <div className="w-full flex flex-col items-center min-h-[100px] justify-center">
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  {t("level")} {level}
                </p>
                <p className="text-5xl font-bold font-mono text-text-primary">
                  {score}
                </p>
              </motion.div>
            ) : phase === "gameover" ? (
              <motion.div
                key="gameover"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-danger font-bold text-2xl mb-1">GAME OVER</p>
                <p className="text-text-muted text-sm">
                  Score:{" "}
                  <span className="text-text-primary font-semibold">
                    {score}
                  </span>
                </p>
                {score > 0 && score >= highScore && (
                  <p className="text-warning text-sm font-medium mt-1 animate-pulse-soft">
                    🏆 NOVO RECORDE!
                  </p>
                )}
                <p className="text-text-muted text-xs mt-1">
                  Melhor: {highScore}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-text-muted text-sm">Pronto para jogar?</p>
                <p className="text-text-muted/50 text-xs mt-1">
                  MELHOR PONTUAÇÃO:{" "}
                  <span className="text-warning">{highScore}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Board */}
        <div className="flex flex-col items-center gap-5">
          <GeniusBoard
            activeColor={activeColor}
            onPress={handleColorPress}
            disabled={inputDisabled}
            shaking={isShaking}
            size="lg"
          />

          {/* Phase dots */}
          {isPlaying && (
            <div className="flex gap-2 items-center">
              {(["showing", "input", "correct"] as const).map((p) => (
                <div
                  key={p}
                  className={`rounded-full transition-all duration-200 ${phase === p ? "w-3 h-3 bg-accent" : "w-2 h-2 bg-surface-3"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="w-full flex flex-col gap-2">
          {!isPlaying ? (
            <>
              <Button variant="primary" fullWidth size="lg" onClick={startGame}>
                {phase === "gameover" ? t("playAgain") : "Começar"}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => router.push("/home")}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                {t("back")}
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuit}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="self-center"
            >
              Desistir
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
