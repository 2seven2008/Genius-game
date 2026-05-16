import { GameColor } from "@/types";

// Frequencies for each color (musical notes)
const COLOR_FREQUENCIES: Record<GameColor, number> = {
  red: 261.63, // C4
  green: 329.63, // E4
  blue: 392.0, // G4
  yellow: 523.25, // C5
};

let audioContext: AudioContext | null = null;
let masterVolume = 0.5;
let muted = false;
const activeOscillators: OscillatorNode[] = [];

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  return audioContext;
}

export function stopAllSounds(): void {
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch {}
  });
  activeOscillators.length = 0;
}

export function playColorSound(color: GameColor, duration = 0.4): void {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      COLOR_FREQUENCIES[color],
      ctx.currentTime,
    );

    gainNode.gain.setValueAtTime(masterVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration,
    );

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);

    activeOscillators.push(oscillator);
    oscillator.onended = () => {
      const idx = activeOscillators.indexOf(oscillator);
      if (idx !== -1) activeOscillators.splice(idx, 1);
    };
  } catch {}
}

export function playWinSound(): void {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(masterVolume * 0.6, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  } catch {}
}

export function playLoseSound(): void {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(masterVolume * 0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

export function playClickSound(): void {
  if (muted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(masterVolume * 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

export function setVolume(v: number): void {
  masterVolume = Math.max(0, Math.min(1, v));
}

export function setMuted(m: boolean): void {
  muted = m;
}

export function getVolume(): number {
  return masterVolume;
}
export function getMuted(): boolean {
  return muted;
}
