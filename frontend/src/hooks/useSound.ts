'use client';
import { useCallback } from 'react';
import { GameColor } from '@/types';
import * as soundService from '@/services/sound';

export function useSound() {
  const playColor = useCallback((color: GameColor, duration?: number) => {
    soundService.playColorSound(color, duration);
  }, []);

  const playWin = useCallback(() => soundService.playWinSound(), []);
  const playLose = useCallback(() => soundService.playLoseSound(), []);
  const playClick = useCallback(() => soundService.playClickSound(), []);

  return { playColor, playWin, playLose, playClick };
}
