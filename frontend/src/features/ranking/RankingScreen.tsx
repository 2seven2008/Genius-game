'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { NeonButton } from '@/components/ui/NeonButton';
import { GeniusLogo } from '@/components/ui/GeniusLogo';
import { scoreApi } from '@/services/api';
import { RankingEntry } from '@/types';

type Category = 'wins' | 'score';

const TOP_COLORS = [
  { label: '1°', color: 'text-sky-400',    border: 'border-sky-500/60',    glow: 'shadow-[0_0_20px_rgba(56,189,248,0.3)]' },
  { label: '2°', color: 'text-yellow-400', border: 'border-yellow-500/60', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]' },
  { label: '3°', color: 'text-orange-400', border: 'border-orange-500/60', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]' },
];

export function RankingScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('wins');
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, [category]);

  async function loadRanking() {
    setIsLoading(true);
    try {
      const { data } = category === 'wins'
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
    category === 'wins' ? `${e.wins ?? 0} Vitórias` : `${e.highScore ?? 0} Score`;

  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center pt-8 pb-10 px-5 max-w-sm mx-auto">
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display font-black text-5xl text-neon-yellow mb-6"
        style={{ textShadow: '0 0 30px rgba(234,179,8,0.5)' }}
      >
        RANKING
      </motion.h1>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 w-full">
        {(['wins', 'score'] as Category[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-1 py-2 rounded-lg font-display font-bold text-sm tracking-wider transition-all ${
              category === c
                ? 'bg-neon-yellow text-black'
                : 'bg-dark-card text-zinc-500 border border-dark-border hover:border-zinc-500'
            }`}
          >
            {c === 'wins' ? 'Vitórias' : 'Score'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 w-full">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-dark-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full flex flex-col gap-3"
        >
          {entries.map((entry, i) => {
            const top = TOP_COLORS[i];
            const isTop3 = i < 3;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {isTop3 ? (
                  <div>
                    <p className={`text-xs font-display font-bold mb-1 ${top.color}`}>
                      {top.label} Lugar
                    </p>
                    <div className={`flex items-center gap-3 bg-dark-card border rounded-xl px-4 py-3 ${top.border} ${top.glow}`}>
                      <div className={`w-9 h-9 rounded-full bg-dark-muted border ${top.border} flex items-center justify-center`}>
                        <User className={`w-5 h-5 ${top.color}`} />
                      </div>
                      <span className={`font-display font-black text-lg flex-1 ${top.color}`}>
                        {entry.username.toUpperCase()}
                      </span>
                      <span className={`font-bold font-body ${top.color}`}>{getValue(entry)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-dark-card border border-dark-border rounded-xl px-4 py-2">
                    <span className="text-zinc-500 font-display text-sm w-5">{i + 1}°</span>
                    <div className="w-8 h-8 rounded-full bg-dark-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-white font-body flex-1">{entry.username}</span>
                    <span className="text-zinc-400 font-body text-sm">{getValue(entry)}</span>
                  </div>
                )}
              </motion.div>
            );
          })}

          {entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 font-body">Nenhum jogador ainda.</p>
              <p className="text-zinc-600 text-sm mt-1">Seja o primeiro!</p>
            </div>
          )}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 w-full">
        <NeonButton variant="red" onClick={() => router.push('/home')} size="sm">
          <ChevronLeft className="w-4 h-4 inline mr-1" /> VOLTAR
        </NeonButton>
      </motion.div>
    </div>
  );
}
