'use client';
import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-text-secondary tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full h-11 bg-surface-3 rounded-xl px-4',
          'text-text-primary text-sm placeholder:text-text-muted',
          'border border-[rgb(var(--border)/0.07)] focus:border-accent/50',
          'outline-none focus:ring-2 focus:ring-accent/20',
          'transition-all duration-150',
          error && 'border-danger/50 focus:border-danger/70 focus:ring-danger/15',
          className
        )}
        {...props}
      />
      {error && <p className="text-danger text-xs">{error}</p>}
      {hint && !error && <p className="text-text-muted text-xs">{hint}</p>}
    </div>
  );
}
