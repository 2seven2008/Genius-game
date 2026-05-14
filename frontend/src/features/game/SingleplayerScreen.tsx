'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { GeniusBoard } from '@/components/game/GeniusBoard';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { NeonButton } from '@/components/ui/NeonButton';
import { useSingleplayer } from '@/hooks/useSingleplayer';

export function SingleplayerScreen() {
  const router = useRouter();
  const { state, startGame, handleColorPress, quit } = useSingleplayer();
  const { phase, score, level, activeColor, highScore } = state;

  const isPlaying = phase !== 'idle' && phase !== 'gameover';
  const isShaking = phase === 'wrong';
  const inputDisabled = phase !== 'input';

  const handleQuit = async () => {
    await quit();
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-between pt-8 pb-10 px-5 max-w-sm mx-auto">
      {/* Score */}
      <div className="w-full flex flex-col items-center gap-1">
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ScoreDisplay score={score} />
            </motion.div>
          ) : phase === 'gameover' ? (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <p className="text-red-400 font-display font-black text-4xl mb-1">GAME OVER</p>
              <p className="text-zinc-400 font-body text-sm">Score final: <span className="text-white font-bold">{score}</span></p>
              {score > 0 && score >= highScore && (
                <p className="text-neon-yellow font-display text-sm mt-1 animate-pulse-glow">
                  🏆 NOVO RECORDE!
                </p>
              )}
              <p className="text-zinc-500 font-body text-xs mt-1">Melhor: {highScore}</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <p className="text-zinc-400 font-body text-sm">Pronto para jogar?</p>
              <p className="text-zinc-600 text-xs mt-1">Melhor: <span className="text-neon-yellow">{highScore}</span></p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Board */}
      <div className="flex flex-col items-center gap-6">
        <GeniusBoard
          activeColor={activeColor}
          onPress={handleColorPress}
          disabled={inputDisabled}
          shaking={isShaking}
        />

        {/* Level indicator */}
        {isPlaying && (
          <motion.p
            key={level}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-zinc-400 font-body text-base"
          >
            Nivel <span className="text-white font-bold">{level}</span>
          </motion.p>
        )}

        {/* Phase indicator */}
        {isPlaying && (
          <div className="flex gap-2">
            {['showing', 'input', 'correct'].map((p) => (
              <div
                key={p}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  phase === p ? 'bg-neon-purple scale-125' : 'bg-dark-border'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col gap-3">
        {phase === 'idle' || phase === 'gameover' ? (
          <>
            <NeonButton variant="purple" fullWidth size="lg" onClick={startGame}>
              {phase === 'gameover' ? 'Jogar Novamente' : 'Iniciar Jogo'}
            </NeonButton>
            <NeonButton variant="gray" fullWidth onClick={() => router.push('/home')}>
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Voltar
            </NeonButton>
          </>
        ) : (
          <NeonButton variant="red" onClick={handleQuit} className="w-auto self-center px-6">
            <ChevronLeft className="w-4 h-4 inline mr-1" /> DESISTIR
          </NeonButton>
        )}
      </div>
    </div>
  );
}
