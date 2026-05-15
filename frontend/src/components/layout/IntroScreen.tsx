'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'g' | 'genius' | 'out'>('g');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('genius'), 900);
    const t2 = setTimeout(() => setPhase('out'), 2200);
    const t3 = setTimeout(() => onComplete(), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const letters = ['E', 'N', 'I', 'U', 'S'];

  return (
    <AnimatePresence>
      {phase !== 'out' && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(var(--surface))]"
        >
          <div className="flex items-center">
            {/* G - always visible */}
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-display font-bold text-6xl text-text-primary tracking-tight"
            >
              G
            </motion.span>

            {/* ENIUS - reveal */}
            <AnimatePresence>
              {phase === 'genius' && letters.map((l, i) => (
                <motion.span
                  key={l}
                  initial={{ opacity: 0, x: -8, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  transition={{ delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display font-bold text-6xl text-text-primary tracking-tight"
                >
                  {l}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
