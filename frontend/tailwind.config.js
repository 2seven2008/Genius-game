/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#C026D3',
        'neon-blue': '#38BDF8',
        'neon-yellow': '#EAB308',
        'neon-red': '#EF4444',
        'neon-green': '#22C55E',
        'neon-orange': '#F97316',
        'dark-base': '#0A0A0F',
        'dark-card': '#12121A',
        'dark-border': '#1E1E2E',
        'dark-muted': '#2A2A3E',
      },
      fontFamily: {
        display: ['var(--font-orbitron)', 'monospace'],
        body: ['var(--font-exo)', 'sans-serif'],
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(192, 38, 211, 0.5)',
        'neon-blue': '0 0 20px rgba(56, 189, 248, 0.5)',
        'neon-yellow': '0 0 20px rgba(234, 179, 8, 0.5)',
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-sm': '0 0 8px rgba(192, 38, 211, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'flash': 'flash 0.3s ease-in-out',
        'shake': 'shake 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'score-pop': 'scorePop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(192, 38, 211, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(192, 38, 211, 0.8)' },
        },
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scorePop: {
          '0%': { transform: 'scale(1)' },
          '60%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
