'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, Trophy, Star, Zap } from 'lucide-react';
import { GeniusLogo } from '@/components/ui/GeniusLogo';
import { NeonButton } from '@/components/ui/NeonButton';
import { NeonInput } from '@/components/ui/NeonInput';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/contexts/auth.store';
import toast from 'react-hot-toast';

type View = 'home' | 'register' | 'login';

export function LandingScreen() {
  const router = useRouter();
  const { login, register, loginAsGuest, isLoading } = useAuthStore();
  const [view, setView] = useState<View>('home');
  const [roomCode, setRoomCode] = useState('');

  // Register form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail]       = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login form
  const [loginEmail, setLoginEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleGuest = async () => {
    try {
      await loginAsGuest();
      router.push('/home');
    } catch {
      toast.error('Erro ao entrar como convidado');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(regUsername, regEmail, regPassword);
      toast.success('Conta criada! Bem-vindo!');
      router.push('/home');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao criar conta');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      router.push('/home');
    } catch {
      toast.error('Email ou senha incorretos');
    }
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) { toast.error('Digite um código de sala'); return; }
    router.push(`/multiplayer?join=${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-start pt-10 pb-8 px-5 max-w-sm mx-auto">
      {/* Logo */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <GeniusLogo />
      </motion.div>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full flex flex-col gap-4"
          >
            {/* Benefits card */}
            <Card glowColor="purple" className="p-5">
              <p className="text-white text-center text-sm font-body mb-4">
                Desbloqueie recursos exclusivos e apareça no ranking
              </p>
              <div className="flex flex-col gap-2 mb-5">
                {[
                  { icon: Star, text: 'Salvar progresso e estatísticas' },
                  { icon: Trophy, text: 'Aparecer no ranking global' },
                  { icon: Zap, text: 'Modo multiplayer completo' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-neon-purple shadow-neon-purple flex-shrink-0" />
                    <span className="text-zinc-300 text-sm font-body">{text}</span>
                  </div>
                ))}
              </div>
              <NeonButton variant="purple" fullWidth onClick={() => setView('register')}>
                Criar Conta
              </NeonButton>
              <p className="text-center text-zinc-500 text-xs mt-3 font-body">
                Já tem uma Conta?{' '}
                <button
                  onClick={() => setView('login')}
                  className="text-neon-blue font-bold hover:text-sky-300 transition-colors"
                >
                  Fazer Login
                </button>
              </p>
            </Card>

            {/* Guest */}
            <NeonButton variant="blue" fullWidth size="lg" onClick={handleGuest} loading={isLoading}>
              Jogar Sem Conta
            </NeonButton>

            {/* Room code */}
            <div className="relative flex items-center my-1">
              <div className="flex-1 h-px bg-dark-border" />
              <span className="px-3 text-xs text-zinc-500 font-body">Ou Continue</span>
              <div className="flex-1 h-px bg-dark-border" />
            </div>

            <Card className="p-4">
              <p className="text-center font-display font-bold text-white text-sm mb-3 tracking-widest">
                CODIGO DE SALA
              </p>
              <NeonInput
                placeholder="Ex: ABC123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-xl tracking-widest uppercase mb-3"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <NeonButton variant="blue" fullWidth onClick={handleJoinRoom}>
                Entrar Na Sala
              </NeonButton>
            </Card>
          </motion.div>
        )}

        {view === 'register' && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full"
          >
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-1 text-zinc-400 mb-6 hover:text-white transition-colors font-body text-sm"
            >
              <ChevronRight className="rotate-180 w-4 h-4" /> Voltar
            </button>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Criar Conta</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <NeonInput
                label="Nome de usuário"
                placeholder="SeuNome123"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
              <NeonInput
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
              <NeonInput
                label="Senha"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
              <NeonButton type="submit" variant="purple" fullWidth size="lg" loading={isLoading} className="mt-2">
                Criar Conta
              </NeonButton>
            </form>
          </motion.div>
        )}

        {view === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full"
          >
            <button
              onClick={() => setView('home')}
              className="flex items-center gap-1 text-zinc-400 mb-6 hover:text-white transition-colors font-body text-sm"
            >
              <ChevronRight className="rotate-180 w-4 h-4" /> Voltar
            </button>
            <h2 className="text-2xl font-display font-bold text-white mb-6">Fazer Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <NeonInput
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <NeonInput
                label="Senha"
                type="password"
                placeholder="Sua senha"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <NeonButton type="submit" variant="purple" fullWidth size="lg" loading={isLoading} className="mt-2">
                Entrar
              </NeonButton>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
