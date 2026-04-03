/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        /* === DARK PURPLE THEME === */
        navy: {
          DEFAULT: '#0f0a1e',
          dark:    '#07040f',
          light:   '#1a1130',
        },
        /* soft-white now maps to the dark background — propagates everywhere */
        'soft-white': {
          DEFAULT: '#020617',
          dark:    '#050d24',
        },
        /* Purple accent palette */
        purple: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#4c1d95',
        },
        indigo: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        /* sky-blue kept for compat but de-emphasised */
        'sky-blue': {
          50:  '#eff8ff',
          100: '#dbeefe',
          200: '#bfe3fe',
          300: '#93d2fd',
          400: '#60b8fa',
          500: '#3a9cf6',
          DEFAULT: '#7C3AED',
          600: '#7C3AED',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          dark:  '#6d28d9',
          light: '#a78bfa',
        },
        /* Semantic color tokens */
        success: {
          DEFAULT: '#10b981',
          light:   '#064e3b',
        },
        danger: {
          DEFAULT: '#ef4444',
          light:   '#450a0a',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light:   '#451a03',
        },
      },

      fontFamily: {
        /* Body font — highly readable */
        jakarta: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        /* Display/heading font — for large UI text */
        outfit:  ['"Outfit"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        /* Elevation system — dark purple theme */
        'level-1': '0 1px 3px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
        'level-2': '0 4px 16px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'level-3': '0 24px 64px rgba(0,0,0,0.6)',
        'navy':    '0 8px 32px rgba(124,58,237,0.2)',
        'accent':  '0 8px 24px rgba(124,58,237,0.35)',
        'lift':    '0 8px 32px rgba(124,58,237,0.15)',
        'purple':  '0 0 30px rgba(124,58,237,0.3)',
        'glow':    '0 0 40px rgba(168,85,247,0.2)',
      },

      borderRadius: {
        'sm':  '6px',
        'md':  '8px',
        'lg':  '12px',
        'xl':  '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },

      animation: {
        'shimmer':     'shimmer 1.5s infinite',
        'spring-pop':  'springPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1.0) forwards',
        'reveal-up':   'revealUp 0.45s cubic-bezier(0.0, 0.0, 0.2, 1.0) forwards',
        'toast-in':    'toastIn 0.35s cubic-bezier(0.0, 0.0, 0.2, 1.0) forwards',
        'toast-out':   'toastOut 0.25s cubic-bezier(0.4, 0.0, 1.0, 1.0) forwards',
        'pulse-ring':  'pulseRing 1.5s ease-out infinite',
      },

      keyframes: {
        shimmer: {
          'from': { backgroundPosition: '200% 0' },
          'to':   { backgroundPosition: '-200% 0' },
        },
        springPop: {
          '0%':   { opacity: '0', transform: 'scale(0.7) translateY(4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        revealUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          'from': { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          'to':   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        toastOut: {
          'from': { opacity: '1', transform: 'translateY(0) scale(1)' },
          'to':   { opacity: '0', transform: 'translateY(-8px) scale(0.96)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)',   opacity: '0' },
        },
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1.0)',
        'out':    'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
        'in':     'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
        'in-out': 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
      },
    },
  },
  plugins: [],
}
