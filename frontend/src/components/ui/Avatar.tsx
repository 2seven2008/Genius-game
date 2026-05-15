'use client';
import React from 'react';
import { cn } from '@/utils/cn';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
const COLORS = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-indigo-500','bg-teal-500','bg-orange-500'];

function getColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) % COLORS.length;
  return COLORS[hash];
}

export function Avatar({ name = '?', size = 'md', className }: AvatarProps) {
  const color = getColor(name);
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0', color, SIZES[size], className)}>
      {initials}
    </div>
  );
}
