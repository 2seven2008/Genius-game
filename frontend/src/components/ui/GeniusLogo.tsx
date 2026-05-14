'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface GeniusLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'text-3xl', md: 'text-5xl', lg: 'text-6xl' };

export function GeniusLogo({ size = 'lg' }: GeniusLogoProps) {
  return (
    <motion.h1
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`font-display font-black tracking-widest ${SIZES[size]} bg-gradient-to-r from-fuchsia-400 via-purple-400 to-violet-400 bg-clip-text text-transparent`}
      style={{
        textShadow: '0 0 30px rgba(192,38,211,0.4)',
        filter: 'drop-shadow(0 0 12px rgba(192,38,211,0.5))',
      }}
    >
      GENIUS
    </motion.h1>
  );
}
