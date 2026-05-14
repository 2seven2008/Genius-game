'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Plus, Users, Copy, Crown } from 'lucide-react';
import { GeniusBoard } from '@/components/game/GeniusBoard';
import { ScoreDisplay } from '@/components/game/ScoreDisplay';
import { NeonButton } from '@/components/ui/NeonButton';
import { NeonInput } from '@/components/ui/NeonInput';
import { Card } from '@/components/ui/Card';
import { GeniusLogo } from '@/components/ui/GeniusLogo';
import { useAuthStore } from '@/contexts/auth.store';
import { roomApi } from '@/services/api';
import { getSocket } from '@/services/socket';
import { useSound } from '@/hooks/useSound';
import { GameColor, PublicRoom, Room, RoomPlayer } from '@/types';
import toast from 'react-hot-toast';

type Screen = 'lobby' | 'room' | 'game' | 'result';
const COLORS: GameColor[] = ['red', 'green', 'blue', 'yellow'];

export function MultiplayerScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { playColor, playWin, playLose } = useSound();

  const [screen, setScreen]           = useState<Screen>('lobby');
  const [joinCode, setJoinCode]        = useState(searchParams.get('join') || '');
  const [publicRooms, setPublicRooms]  = useState<PublicRoom[]>([]);
  const [room, setRoom]                = useState<Room | null>(null);
  const [isCreating, setIsCreating]    = useState(false);
  const [isJoining, setIsJoining]      = useState(false);
  const [showMore, setShowMore]        = useState(false);

  // Game state
  const [sequence, setSequence]          = useState<GameColor[]>([]);
  const [activeColor, setActiveColor]    = useState<GameColor | null>(null);
  const [playerInput, setPlayerInput]    = useState<GameColor[]>([]);
  const [isMyTurn, setIsMyTurn]          = useState(false);
  const [gameLevel, setGameLevel]        = useState(0);
  const [isShaking, setIsShaking]        = useState(false);
  const [gameResult, setGameResult]      = useState<{winner: RoomPlayer | null, players: RoomPlayer[]} | null>(null);
  const [showingSequence, setShowingSequence] = useState(false);

  const socket = getSocket();
  const showTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Auto-join if code in URL
  useEffect(() => {
    const code = searchParams.get('join');
    if (code) {
      setJoinCode(code);
      // slight delay to allow auth
      setTimeout(() => handleJoinRoom(code), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    socket.on('public_rooms_update', (rooms: PublicRoom[]) => setPublicRooms(rooms));
    socket.on('room_created', ({ room: r }: { room: Room }) => { setRoom(r); setScreen('room'); });
    socket.on('room_updated', ({ room: r }: { room: Room }) => setRoom(r));
    socket.on('error', ({ message }: { message: string }) => toast.error(message));
    socket.on('host_changed', () => toast('Você é o novo host!'));

    socket.on('match_started', ({ sequence: seq, level }: { sequence: GameColor[]; level: number }) => {
      setSequence(seq);
      setGameLevel(level);
      setScreen('game');
      setPlayerInput([]);
      setIsMyTurn(false);
      showSequenceAnimation(seq);
    });

    socket.on('your_turn', ({ playerId, sequence: seq }: { playerId: string; sequence: GameColor[] }) => {
      setSequence(seq);
      setIsMyTurn(playerId === user?.id);
      setPlayerInput([]);
    });

    socket.on('next_round', ({ sequence: seq, level, players }: any) => {
      setGameLevel(level);
      setSequence(seq);
      setRoom((r) => r ? { ...r, players } : r);
      setPlayerInput([]);
      setIsMyTurn(false);
      setActiveColor(null);
      showSequenceAnimation(seq);
    });

    socket.on('player_failed', ({ userId, players }: any) => {
      if (userId === user?.id) {
        playLose();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
      setRoom((r) => r ? { ...r, players } : r);
    });

    socket.on('player_correct', ({ userId, score }: any) => {
      if (userId === user?.id) playWin();
      setRoom((r) => r ? {
        ...r,
        players: r.players.map(p => p.userId === userId ? { ...p, score } : p),
      } : r);
    });

    socket.on('match_ended', ({ winner, players }: any) => {
      setGameResult({ winner, players });
      setScreen('result');
      if (winner?.userId === user?.id) playWin();
      else playLose();
    });

    socket.on('room_reset', ({ room: r }: { room: Room }) => {
      setRoom(r);
      setScreen('room');
      setGameResult(null);
      setSequence([]);
      setPlayerInput([]);
      setIsMyTurn(false);
    });

    socket.on('player_disconnected', ({ username, players }: any) => {
      toast(`${username} desconectou`);
      setRoom((r) => r ? { ...r, players } : r);
    });

    return () => {
      socket.off('public_rooms_update');
      socket.off('room_created');
      socket.off('room_updated');
      socket.off('error');
      socket.off('host_changed');
      socket.off('match_started');
      socket.off('your_turn');
      socket.off('next_round');
      socket.off('player_failed');
      socket.off('player_correct');
      socket.off('match_ended');
      socket.off('room_reset');
      socket.off('player_disconnected');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function showSequenceAnimation(seq: GameColor[]) {
    showTimeouts.current.forEach(clearTimeout);
    showTimeouts.current = [];
    setShowingSequence(true);
    setActiveColor(null);

    seq.forEach((color, i) => {
      const t1 = setTimeout(() => { setActiveColor(color); playColor(color); }, i * 700 + 400);
      const t2 = setTimeout(() => setActiveColor(null), i * 700 + 900);
      showTimeouts.current.push(t1, t2);
    });

    const done = setTimeout(() => {
      setShowingSequence(false);
      // Signal host that sequence is done
      if (room && socket) {
        socket.emit('sequence_shown', { code: room.code });
      }
    }, seq.length * 700 + 1100);
    showTimeouts.current.push(done);
  }

  const handleCreateRoom = async () => {
    if (!user) { toast.error('Faça login para criar salas'); return; }
    setIsCreating(true);
    try {
      const { data } = await roomApi.create(true, 2);
      socket.emit('create_room', {
        code: data.code,
        dbId: data.id,
        userId: user.id,
        username: user.username,
        isPublic: data.isPublic,
        maxPlayers: data.maxPlayers,
      });
    } catch {
      toast.error('Erro ao criar sala');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = useCallback(async (code?: string) => {
    const c = (code ?? joinCode).toUpperCase().trim();
    if (!c) { toast.error('Digite um código'); return; }
    if (!user) { toast.error('Faça login primeiro'); return; }
    setIsJoining(true);
    try {
      await roomApi.getByCode(c); // validate
      socket.emit('join_room', { code: c, userId: user.id, username: user.username });
      setScreen('room');
    } catch {
      toast.error('Sala não encontrada ou indisponível');
    } finally {
      setIsJoining(false);
    }
  }, [joinCode, user, socket]);

  const handleJoinPublic = (code: string) => {
    setJoinCode(code);
    handleJoinRoom(code);
  };

  const handleStartMatch = () => {
    if (!room) return;
    socket.emit('start_match', { code: room.code });
  };

  const handleColorPress = (color: GameColor) => {
    if (!isMyTurn || showingSequence || !room) return;
    playColor(color, 0.25);
    const newInput = [...playerInput, color];
    setPlayerInput(newInput);
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);

    if (newInput.length === sequence.length) {
      socket.emit('player_input', { code: room.code, userId: user?.id, inputSequence: newInput });
      setPlayerInput([]);
      setIsMyTurn(false);
    }
  };

  const handleLeave = () => {
    if (room) socket.emit('leave_room', { code: room.code });
    setRoom(null);
    setScreen('lobby');
    setSequence([]);
    setGameResult(null);
  };

  const copyCode = () => {
    if (room) { navigator.clipboard.writeText(room.code); toast.success('Código copiado!'); }
  };

  const isHost = room && socket.id === room.hostSocketId;

  const displayedRooms = showMore ? publicRooms : publicRooms.slice(0, 4);

  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-start pt-8 pb-10 px-5 max-w-sm mx-auto">

      {/* LOBBY */}
      <AnimatePresence mode="wait">
        {screen === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => router.push('/home')} className="text-zinc-400 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="font-display font-black text-neon-blue text-2xl tracking-wider">MULTIPLAYER</h1>
            </div>

            {/* Create room */}
            <Card glowColor="blue" className="mb-4 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Plus className="w-5 h-5 text-neon-blue" />
                <h3 className="font-display font-bold text-white text-lg">Criar Sala</h3>
              </div>
              <p className="text-zinc-500 text-xs font-body mb-4">
                Crie uma nova sala e compartilhe o código com seus amigos
              </p>
              <NeonButton variant="blue" fullWidth onClick={handleCreateRoom} loading={isCreating}>
                Criar Nova Sala
              </NeonButton>
            </Card>

            {/* Divider */}
            <div className="relative flex items-center my-4">
              <div className="flex-1 h-px bg-dark-border" />
              <span className="px-3 text-xs text-zinc-500 font-body">Ou Continue</span>
              <div className="flex-1 h-px bg-dark-border" />
            </div>

            {/* Join by code */}
            <Card className="mb-4 p-4">
              <p className="text-center font-display font-bold text-white text-sm mb-3 tracking-widest">
                CODIGO DE SALA
              </p>
              <NeonInput
                placeholder="Ex: ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-xl tracking-widest uppercase mb-3"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <NeonButton variant="blue" fullWidth onClick={() => handleJoinRoom()} loading={isJoining}>
                Entrar Na Sala
              </NeonButton>
            </Card>

            {/* Public rooms */}
            {publicRooms.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-zinc-400" />
                  <h3 className="font-display font-bold text-white">Salas Públicas</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {displayedRooms.map((r) => (
                    <div key={r.code} className="flex items-center justify-between bg-dark-base rounded-lg px-3 py-2">
                      <div>
                        <span className="text-white font-display font-bold text-sm">Modo: Versus</span>
                        <span className="text-zinc-500 text-xs font-body ml-2">Host: {r.host}</span>
                      </div>
                      <NeonButton variant="blue" size="sm" onClick={() => handleJoinPublic(r.code)}>
                        Entrar
                      </NeonButton>
                    </div>
                  ))}
                </div>
                {publicRooms.length > 4 && (
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="w-full mt-3 text-zinc-400 text-sm font-body flex items-center justify-center gap-1 hover:text-white"
                  >
                    <ChevronLeft className={`w-4 h-4 transition-transform ${showMore ? 'rotate-90' : '-rotate-90'}`} />
                    {showMore ? 'Ver Menos' : 'Ver Mais'}
                  </button>
                )}
              </Card>
            )}
          </motion.div>
        )}

        {/* ROOM LOBBY */}
        {screen === 'room' && room && (
          <motion.div key="room" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="w-full">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleLeave} className="text-zinc-400 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="font-display font-black text-neon-blue text-2xl tracking-wider">SALA</h1>
            </div>

            {/* Room code */}
            <Card glowColor="blue" className="mb-4 p-4 text-center">
              <p className="text-zinc-400 text-xs font-body mb-1 tracking-widest uppercase">Código da Sala</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-display font-black text-4xl text-white tracking-widest">{room.code}</span>
                <button onClick={copyCode} className="text-zinc-500 hover:text-neon-blue transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-zinc-500 text-xs mt-2 font-body">Compartilhe com seus amigos</p>
            </Card>

            {/* Players */}
            <Card className="mb-4 p-4">
              <p className="font-display font-bold text-white mb-3">
                Jogadores ({room.players.length}/{room.maxPlayers})
              </p>
              <div className="flex flex-col gap-2">
                {room.players.map((p) => (
                  <div key={p.userId} className="flex items-center gap-3 bg-dark-base rounded-lg px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-dark-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-white font-body font-medium">{p.username}</span>
                    {p.socketId === room.hostSocketId && (
                      <Crown className="w-4 h-4 text-neon-yellow ml-auto" />
                    )}
                  </div>
                ))}
                {Array.from({ length: room.maxPlayers - room.players.length }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 bg-dark-base/50 rounded-lg px-3 py-2 border border-dashed border-dark-border">
                    <div className="w-8 h-8 rounded-full bg-dark-muted/50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-zinc-700" />
                    </div>
                    <span className="text-zinc-600 font-body text-sm">Aguardando...</span>
                  </div>
                ))}
              </div>
            </Card>

            {isHost ? (
              <NeonButton
                variant="purple"
                fullWidth
                size="lg"
                onClick={handleStartMatch}
                disabled={room.players.length < 2}
              >
                {room.players.length < 2 ? 'Aguardando jogadores...' : 'Iniciar Partida'}
              </NeonButton>
            ) : (
              <p className="text-center text-zinc-500 font-body text-sm animate-pulse">
                Aguardando o host iniciar...
              </p>
            )}
          </motion.div>
        )}

        {/* GAME */}
        {screen === 'game' && room && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center justify-between min-h-screen pt-4 pb-8"
          >
            {/* Players scores */}
            <div className="w-full flex justify-between mb-4">
              {room.players.map((p) => (
                <div key={p.userId}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all ${
                    p.isAlive ? 'bg-dark-card border border-dark-border' : 'bg-dark-card/30 opacity-40'
                  }`}
                >
                  <span className={`font-display font-bold text-xs ${p.isAlive ? 'text-white' : 'text-zinc-600 line-through'}`}>
                    {p.username}
                  </span>
                  <span className="text-neon-yellow font-bold text-sm">{p.score}</span>
                </div>
              ))}
            </div>

            <ScoreDisplay score={room.players.find(p => p.userId === user?.id)?.score ?? 0} label={`NÍVEL ${gameLevel}`} />

            <GeniusBoard
              activeColor={activeColor}
              onPress={handleColorPress}
              disabled={!isMyTurn || showingSequence}
              shaking={isShaking}
            />

            <div className="text-center">
              {showingSequence && <p className="text-zinc-400 font-body text-sm animate-pulse">Observe a sequência...</p>}
              {isMyTurn && !showingSequence && <p className="text-neon-purple font-display font-bold animate-pulse">SUA VEZ!</p>}
              {!isMyTurn && !showingSequence && (
                <p className="text-zinc-600 font-body text-sm">Aguardando outros jogadores...</p>
              )}
            </div>

            <NeonButton variant="red" size="sm" onClick={handleLeave}>
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Sair
            </NeonButton>
          </motion.div>
        )}

        {/* RESULT */}
        {screen === 'result' && gameResult && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center gap-6 pt-12"
          >
            <GeniusLogo size="md" />
            <div className="text-center">
              {gameResult.winner?.userId === user?.id ? (
                <>
                  <p className="text-neon-yellow font-display font-black text-5xl">🏆</p>
                  <p className="text-neon-yellow font-display font-black text-3xl mt-2">VITÓRIA!</p>
                </>
              ) : (
                <>
                  <p className="text-4xl">😔</p>
                  <p className="text-zinc-400 font-display font-bold text-2xl mt-2">DERROTA</p>
                </>
              )}
              {gameResult.winner && (
                <p className="text-zinc-400 font-body text-sm mt-2">
                  Vencedor: <span className="text-white font-bold">{gameResult.winner.username}</span>
                </p>
              )}
            </div>

            <Card className="w-full p-4">
              <p className="font-display font-bold text-white mb-3 text-sm">Placar Final</p>
              {gameResult.players.sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.userId} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-display text-sm w-4">{i + 1}°</span>
                    <span className="text-white font-body">{p.username}</span>
                    {!p.isAlive && <span className="text-red-500 text-xs">✗</span>}
                  </div>
                  <span className="text-neon-yellow font-bold">{p.score}</span>
                </div>
              ))}
            </Card>

            <div className="flex gap-3 w-full">
              <NeonButton variant="gray" fullWidth onClick={handleLeave}>Sair</NeonButton>
              {room && <NeonButton variant="purple" fullWidth onClick={() => setScreen('room')}>Jogar de Novo</NeonButton>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
