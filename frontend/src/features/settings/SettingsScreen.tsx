'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GeniusLogo } from '@/components/ui/GeniusLogo';
import { NeonButton } from '@/components/ui/NeonButton';
import toast from 'react-hot-toast';

export function SettingsScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState('Português (Brasil)');

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Cache limpo com sucesso!');
    }
  };

  const rows = [
    { label: 'Versão do App', value: 'v1.0.0', action: null },
    { label: 'Idioma', value: language, action: null },
  ];

  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center pt-10 pb-10 px-5 max-w-sm mx-auto">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
        <GeniusLogo />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full flex flex-col"
      >
        {/* Settings rows */}
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden mb-4">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-4 ${
                i < rows.length - 1 ? 'border-b border-dark-border' : ''
              }`}
            >
              <span className="text-white font-body font-medium">{row.label}</span>
              <span className="text-zinc-400 font-body text-sm">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Clear cache */}
        <button
          onClick={handleClearCache}
          className="bg-dark-card border border-dark-border rounded-2xl px-4 py-4 text-left hover:border-zinc-500 transition-colors mb-8"
        >
          <span className="text-white font-body font-medium">Limpar Cache</span>
        </button>

        {/* Back */}
        <NeonButton variant="red" size="sm" onClick={() => router.push('/home')}>
          <ChevronLeft className="w-4 h-4 inline mr-1" /> VOLTAR
        </NeonButton>
      </motion.div>
    </div>
  );
}
