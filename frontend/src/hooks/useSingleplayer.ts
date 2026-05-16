"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { GameColor, GamePhase, SingleplayerState } from "@/types";
import { useSound } from "./useSound";
import * as soundService from "@/services/sound";
import { scoreApi } from "@/services/api";
import { useAuthStore } from "@/contexts/auth.store";

const COLORS: GameColor[] = ["red", "green", "blue", "yellow"];
const BASE_SHOW_INTERVAL = 800;
const MIN_SHOW_INTERVAL = 300;

function randomColor(): GameColor {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function calcInterval(level: number): number {
  return Math.max(MIN_SHOW_INTERVAL, BASE_SHOW_INTERVAL - level * 20);
}

export function useSingleplayer() {
  const { user, updateStats } = useAuthStore();
  const { playColor, playWin, playLose } = useSound();

  const [state, setState] = useState<SingleplayerState>({
    sequence: [],
    playerInput: [],
    level: 0,
    score: 0,
    phase: "idle",
    activeColor: null,
    highScore: user?.highScore ?? 0,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const showSequenceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Show sequence animation
  const showSequence = useCallback(
    (sequence: GameColor[], level: number) => {
      setState((s) => ({ ...s, phase: "showing", activeColor: null }));
      const interval = calcInterval(level);

      sequence.forEach((color, i) => {
        // Illuminate
        showSequenceTimeout.current = setTimeout(
          () => {
            setState((s) => ({ ...s, activeColor: color }));
            playColor(color);
          },
          i * (interval + 200),
        );

        // Turn off
        showSequenceTimeout.current = setTimeout(
          () => {
            setState((s) => ({ ...s, activeColor: null }));
          },
          i * (interval + 200) + interval,
        );
      });

      // After all shown, allow input
      showSequenceTimeout.current = setTimeout(
        () => {
          setState((s) => ({ ...s, phase: "input", activeColor: null }));
        },
        sequence.length * (interval + 200) + 300,
      );
    },
    [playColor],
  );

  const startGame = useCallback(() => {
    if (showSequenceTimeout.current) clearTimeout(showSequenceTimeout.current);
    const first = randomColor();
    const newSeq = [first];
    setState({
      sequence: newSeq,
      playerInput: [],
      level: 1,
      score: 0,
      phase: "showing",
      activeColor: null,
      highScore: user?.highScore ?? 0,
    });
    setTimeout(() => showSequence(newSeq, 1), 600);
  }, [showSequence, user]);

  const handleColorPress = useCallback(
    (color: GameColor) => {
      const { phase, sequence, playerInput, level, score } = stateRef.current;
      if (phase !== "input") return;

      playColor(color, 0.25);

      const newInput = [...playerInput, color];
      const idx = newInput.length - 1;

      // Wrong press
      if (color !== sequence[idx]) {
        playLose();
        setState((s) => ({ ...s, phase: "wrong", activeColor: color }));

        setTimeout(async () => {
          setState((s) => ({ ...s, phase: "gameover", activeColor: null }));
          // Save score
          if (user && !user.isGuest) {
            try {
              const { data } = await scoreApi.save(score, level);
              updateStats({ highScore: data.highScore, matches: data.matches });
              setState((s) => ({ ...s, highScore: data.highScore }));
            } catch {}
          }
        }, 800);
        return;
      }

      setState((s) => ({ ...s, playerInput: newInput, activeColor: color }));

      setTimeout(() => setState((s) => ({ ...s, activeColor: null })), 200);

      // Completed sequence
      if (newInput.length === sequence.length) {
        const newScore = score + level * 100;
        playWin();
        setState((s) => ({ ...s, phase: "correct", score: newScore }));

        setTimeout(() => {
          const nextLevel = level + 1;
          const nextSeq = [...sequence, randomColor()];
          setState((s) => ({
            ...s,
            sequence: nextSeq,
            playerInput: [],
            level: nextLevel,
            score: newScore,
            phase: "showing",
          }));
          showSequence(nextSeq, nextLevel);
        }, 600);
      }
    },
    [playColor, playWin, playLose, showSequence, user, updateStats],
  );

  const quit = useCallback(async () => {
    soundService.stopAllSounds();
    if (showSequenceTimeout.current) clearTimeout(showSequenceTimeout.current);
    const { score, level } = stateRef.current;
    if (user && !user.isGuest && score > 0) {
      try {
        const { data } = await scoreApi.save(score, level);
        updateStats({ highScore: data.highScore, matches: data.matches });
      } catch {}
    }
    setState((s) => ({ ...s, phase: "idle", activeColor: null }));
  }, [user, updateStats]);

  useEffect(() => {
    return () => {
      if (showSequenceTimeout.current)
        clearTimeout(showSequenceTimeout.current);
    };
  }, []);

  return { state, startGame, handleColorPress, quit };
}
