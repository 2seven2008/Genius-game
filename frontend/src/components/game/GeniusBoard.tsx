'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { GameColor } from '@/types';
import { cn } from '@/utils/cn';

interface GeniusBoardProps {
  activeColor: GameColor | null;
  onPress?: (color: GameColor) => void;
  disabled?: boolean;
  shaking?: boolean;
}

const COLOR_CONFIG = {
  red:    { base: 'bg-red-700',    active: 'bg-red-400',    glow: 'shadow-[0_0_40px_rgba(239,68,68,0.9)]',   pos: 'top-0 left-0',     rounded: 'rounded-tl-full' },
  green:  { base: 'bg-green-700',  active: 'bg-green-400',  glow: 'shadow-[0_0_40px_rgba(34,197,94,0.9)]',   pos: 'top-0 right-0',    rounded: 'rounded-tr-full' },
  blue:   { base: 'bg-blue-700',   active: 'bg-blue-400',   glow: 'shadow-[0_0_40px_rgba(56,189,248,0.9)]',  pos: 'bottom-0 left-0',  rounded: 'rounded-bl-full' },
  yellow: { base: 'bg-yellow-600', active: 'bg-yellow-300', glow: 'shadow-[0_0_40px_rgba(234,179,8,0.9)]',   pos: 'bottom-0 right-0', rounded: 'rounded-br-full' },
} as const;

const COLORS: GameColor[] = ['red', 'green', 'blue', 'yellow'];

export function GeniusBoard({ activeColor, onPress, disabled, shaking }: GeniusBoardProps) {
  return (
    <motion.div
      className={cn('relative w-72 h-72 sm:w-80 sm:h-80 select-none', shaking && 'animate-shake')}
      animate={shaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-dark-border/50" />

      {COLORS.map((color) => {
        const cfg = COLOR_CONFIG[color];
        const isActive = activeColor === color;
        return (
          <motion.button
            key={color}
            className={cn(
              'absolute w-[calc(50%-6px)] h-[calc(50%-6px)]',
              cfg.pos,
              cfg.rounded,
              'cursor-pointer transition-all duration-100',
              isActive ? [cfg.active, cfg.glow] : [cfg.base, 'hover:brightness-125'],
              disabled && !isActive && 'cursor-not-allowed opacity-80'
            )}
            onClick={() => !disabled && onPress?.(color)}
            whileTap={!disabled ? { scale: 0.93 } : {}}
            animate={isActive ? { scale: 1.04 } : { scale: 1 }}
            transition={{ duration: 0.08 }}
            aria-label={color}
          />
        );
      })}

      {/* Center circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-14 h-14 rounded-full bg-dark-base border-2 border-dark-border shadow-lg" />
      </div>

      {/* Gap lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-full h-3 bg-dark-base" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-3 h-full bg-dark-base" />
      </div>
    </motion.div>
  );
}
