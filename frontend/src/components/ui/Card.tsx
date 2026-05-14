'use client';
import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'purple' | 'blue' | 'yellow' | 'red' | 'none';
}

const GLOW: Record<string, string> = {
  purple: 'border-purple-500/40 shadow-[0_0_20px_rgba(192,38,211,0.15)]',
  blue:   'border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.15)]',
  yellow: 'border-amber-500/40 shadow-[0_0_20px_rgba(234,179,8,0.15)]',
  red:    'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  none:   'border-dark-border',
};

export function Card({ children, className, glowColor = 'none' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-dark-card border rounded-2xl p-4',
        GLOW[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}
