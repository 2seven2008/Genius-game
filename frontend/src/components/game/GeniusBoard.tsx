"use client";
import React from "react";
import { motion } from "framer-motion";
import { GameColor } from "@/types";
import { cn } from "@/utils/cn";

interface GeniusBoardProps {
  activeColor: GameColor | null;
  onPress?: (color: GameColor) => void;
  disabled?: boolean;
  shaking?: boolean;
  size?: "sm" | "md" | "lg";
}

const COLOR_CONFIG = {
  red: {
    base: "bg-red-600/80",
    active: "bg-red-400",
    ring: "ring-red-400/50",
    pos: "top-0 left-0",
    rounded: "rounded-tl-[50%]",
  },
  green: {
    base: "bg-emerald-600/80",
    active: "bg-emerald-400",
    ring: "ring-emerald-400/50",
    pos: "top-0 right-0",
    rounded: "rounded-tr-[50%]",
  },
  blue: {
    base: "bg-blue-600/80",
    active: "bg-blue-400",
    ring: "ring-blue-400/50",
    pos: "bottom-0 left-0",
    rounded: "rounded-bl-[50%]",
  },
  yellow: {
    base: "bg-amber-500/80",
    active: "bg-amber-300",
    ring: "ring-amber-300/50",
    pos: "bottom-0 right-0",
    rounded: "rounded-br-[50%]",
  },
} as const;

const COLORS: GameColor[] = ["red", "green", "blue", "yellow"];
const SIZES = {
  sm: "w-52 h-52",
  md: "w-64 h-64 sm:w-72 sm:h-72",
  lg: "w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96",
};

export function GeniusBoard({
  activeColor,
  onPress,
  disabled,
  shaking,
  size = "md",
}: GeniusBoardProps) {
  const gap = 10; // px

  return (
    <motion.div
      className={cn("relative select-none", SIZES[size])}
      animate={shaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-[rgb(var(--border)/0.12)]" />

      {COLORS.map((color) => {
        const cfg = COLOR_CONFIG[color];
        const isActive = activeColor === color;
        return (
          <motion.button
            key={color}
            className={cn(
              "absolute",
              cfg.rounded,
              cfg.pos,
              "cursor-pointer select-none outline-none",
              "transition-all duration-100",
              isActive
                ? [cfg.active, "ring-4", cfg.ring, "brightness-110"]
                : [cfg.base, "hover:brightness-110"],
              disabled && !isActive && "cursor-default opacity-75",
            )}
            style={{
              width: `calc(50% - ${gap / 2}px)`,
              height: `calc(50% - ${gap / 2}px)`,
            }}
            onClick={() => !disabled && onPress?.(color)}
            whileTap={
              !disabled ? { scale: 0.94, filter: "brightness(1.2)" } : {}
            }
            animate={isActive ? { scale: 1.03 } : { scale: 1 }}
            transition={{ duration: 0.08 }}
            aria-label={color}
          />
        );
      })}

      {/* Center hub */}
      <div
        className="absolute inset-0 m-auto pointer-events-none z-10 flex items-center justify-center"
        style={{ width: gap * 3.5, height: gap * 3.5 }}
      >
        <div className="w-full h-full rounded-full bg-[rgb(var(--surface))] border border-[rgb(var(--border)/0.12)] shadow-sm" />
      </div>

      {/* Gap lines */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className="w-full bg-[rgb(var(--surface))]"
          style={{ height: gap }}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div
          className="h-full bg-[rgb(var(--surface))]"
          style={{ width: gap }}
        />
      </div>
    </motion.div>
  );
}
