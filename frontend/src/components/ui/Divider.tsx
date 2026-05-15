'use client';
import React from 'react';
import { cn } from '@/utils/cn';

export function Divider({ label, className }: { label?: string; className?: string }) {
  if (!label) return <div className={cn('h-px bg-[rgb(var(--border)/0.07)]', className)} />;
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-1 h-px bg-[rgb(var(--border)/0.07)]" />
      <span className="text-xs text-text-muted shrink-0">{label}</span>
      <div className="flex-1 h-px bg-[rgb(var(--border)/0.07)]" />
    </div>
  );
}
