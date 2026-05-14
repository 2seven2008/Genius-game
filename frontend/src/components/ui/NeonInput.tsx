'use client';
import React from 'react';
import { cn } from '@/utils/cn';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function NeonInput({ label, error, className, ...props }: NeonInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-display font-bold text-zinc-400 mb-1 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-dark-base border border-dark-border rounded-lg px-4 py-3',
          'text-white font-body placeholder:text-zinc-600',
          'focus:outline-none focus:border-neon-purple focus:shadow-glow-sm',
          'transition-all duration-150',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
