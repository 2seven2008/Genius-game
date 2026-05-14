'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  label?: string;
}

const DIGIT_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#38BDF8', '#C026D3'];

export function ScoreDisplay({ score, label = 'SCORE' }: ScoreDisplayProps) {
  const digits = String(score).padStart(5, '0');

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-0.5">
        {digits.split('').map((d, i) => (
          <AnimatePresence key={i} mode="popLayout">
            <motion.span
              key={`${i}-${d}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              className="text-5xl sm:text-6xl font-display font-black tabular-nums"
              style={{ color: DIGIT_COLORS[i % DIGIT_COLORS.length] }}
            >
              {d}
            </motion.span>
          </AnimatePresence>
        ))}
      </div>
      <p className="text-white font-display font-bold text-lg tracking-widest mt-1">{label}</p>
    </div>
  );
}
