'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Trophy, Gamepad2, Settings, LogOut, Swords } from 'lucide-react';
import { GeniusLogo } from '@/components/ui/GeniusLogo';
import { NeonButton } from '@/components/ui/NeonButton';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/contexts/auth.store';
import { disconnectSocket } from '@/services/socket';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    router.push('/');
  };

  const menuItems = [
    { label: 'SINGLEPLAYER', variant: 'purple' as const, icon: Gamepad2, href: '/singleplayer' },
    { label: 'MULTIPLAYER',  variant: 'blue' as const,   icon: Swords,   href: '/multiplayer' },
    { label: 'RANKINGS',     variant: 'orange' as const, icon: Trophy,   href: '/ranking' },
    { label: 'CONFIGURAÇÃO', variant: 'gray' as const,   icon: Settings, href: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-start pt-10 pb-8 px-5 max-w-sm mx-auto">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <GeniusLogo />
      </motion.div>

      {/* User card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full mb-8"
      >
        <Card glowColor="purple" className="flex items-center gap-4 p-4">
          <div className="w-14 h-14 rounded-full bg-dark-muted border-2 border-neon-purple/40 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-neon-purple" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg leading-tight">
              {user?.username ?? 'Usuário'}
              {user?.isGuest && (
                <span className="ml-2 text-xs font-body text-zinc-500 font-normal">(Visitante)</span>
              )}
            </p>
            <p className="text-zinc-400 text-xs font-body mt-0.5">
              {user?.wins ?? 0} Vitórias &nbsp;·&nbsp; {user?.matches ?? 0} Partidas
            </p>
            <p className="text-zinc-400 text-xs font-body">
              Melhor Score:{' '}
              <span className="text-neon-yellow font-bold">{user?.highScore ?? 0}</span>
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Menu */}
      <div className="w-full mb-2">
        <p className="text-center text-zinc-500 text-xs font-display tracking-widest mb-4">
          Modos de Jogo
        </p>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {menuItems.map(({ label, variant, icon: Icon, href }) => (
            <motion.div key={label} variants={item}>
              <NeonButton
                variant={variant}
                fullWidth
                size="lg"
                onClick={() => router.push(href)}
                className="flex items-center justify-center gap-2"
              >
                <Icon className="w-5 h-5" />
                {label}
              </NeonButton>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full mt-4"
      >
        <NeonButton variant="red" fullWidth onClick={handleLogout}>
          <LogOut className="w-4 h-4 inline mr-2" />
          Sair da Conta
        </NeonButton>
      </motion.div>
    </div>
  );
}
