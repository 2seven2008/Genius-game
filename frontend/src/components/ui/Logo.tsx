'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const SIZES = { sm: 'text-2xl', md: 'text-4xl', lg: 'text-5xl' };

export function Logo({ size = 'lg', animate = true }: LogoProps) {
  const letters = ['G', 'E', 'N', 'I', 'U', 'S'];
  if (!animate) {
    return (
      <span className={`font-display font-bold tracking-tight text-text-primary ${SIZES[size]}`}>
        GENIUS
      </span>
    );
  }
  return (
    <motion.div className="flex items-center" aria-label="GENIUS">
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 + 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`font-display font-bold tracking-tight text-text-primary ${SIZES[size]}`}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
}
