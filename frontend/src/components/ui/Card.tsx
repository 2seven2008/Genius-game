'use client';
import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'raised' | 'flat' | 'accent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const VARIANTS: Record<string, string> = {
  default: 'bg-surface-2 border-default',
  raised:  'bg-surface-2 border-default shadow-md',
  flat:    'bg-surface-3',
  accent:  'bg-accent/8 border border-accent/20',
};
const PADDINGS: Record<string, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
};

export function Card({ children, className, variant = 'default', padding = 'md' }: CardProps) {
  return (
    <div className={cn('rounded-2xl border', VARIANTS[variant], PADDINGS[padding], className)}>
      {children}
    </div>
  );
}
