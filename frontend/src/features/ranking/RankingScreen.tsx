"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Medal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useT } from "@/contexts/i18n";
import { scoreApi } from "@/services/api";
import { RankingEntry } from "@/types";

type Category = "wins" | "score";

const MEDAL_COLORS = ["text-amber-400", "text-slate-300", "text-amber-600"];

export function RankingScreen() {
  const router = useRouter();
  const t = useT();
  const [category, setCategory] = useState<Category>("wins");
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, [category]);

  async function loadRanking() {
    setIsLoading(true);
    try {
      const { data } =
        category === "wins"
          ? await scoreApi.rankingByWins(20)
          : await scoreApi.rankingByScore(20);
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }

  const getValue = (e: RankingEntry) =>
    category === "wins"
      ? `${e.wins ?? 0} ${t("wins")}`
      : `${e.highScore ?? 0} pts`;

  return (
    <div className="page">
      <div className="page-inner pt-14 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/home")}
            className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-xl text-text-primary">
            {t("ranking")}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-surface-3 p-1 rounded-xl">
          {(["wins", "score"] as Category[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                category === c
                  ? "bg-surface-2 text-text-primary shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {c === "wins" ? t("wins") : "Score"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-surface-2 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-2"
          >
            {entries.map((entry, i) => {
              const isTop3 = i < 3;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card variant={isTop3 ? "raised" : "default"} padding="sm">
                    <div className="flex items-center gap-3">
                      <div className="w-7 flex items-center justify-center shrink-0">
                        {isTop3 ? (
                          <Medal className={`w-4 h-4 ${MEDAL_COLORS[i]}`} />
                        ) : (
                          <span className="text-xs text-text-muted font-mono">
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <Avatar name={entry.username} size="sm" />
                      <span
                        className={`flex-1 text-sm font-medium truncate ${isTop3 ? "text-text-primary" : "text-text-secondary"}`}
                      >
                        {entry.username}
                      </span>
                      <span
                        className={`text-sm font-semibold ${isTop3 ? "text-warning" : "text-text-muted"}`}
                      >
                        {getValue(entry)}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {entries.length === 0 && (
              <div className="text-center py-16">
                <p className="text-text-muted">{t("noPlayers")}</p>
                <p className="text-text-muted/50 text-sm mt-1">
                  {t("beFirst")}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
