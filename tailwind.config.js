/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./main.tsx" 
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arimo', 'Noto Sans SC', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        'background-light': 'var(--color-background-light)',
        'surface-white': 'var(--color-surface-white)',
        'text-main': 'var(--color-text-main)',
        'text-sub': 'var(--color-text-sub)',
        'bg-dark': 'var(--color-bg-dark)',
        'surface-dark': 'var(--color-surface-dark)',
        'border-dark': 'var(--color-border-dark)',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'ripple-animation': {
          'to': { transform: 'scale(4)', opacity: '0' },
        },
        'glow-pulse': {
          '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: '1' },
          '100%': { transform: 'translate(-50%, -50%) scale(2.5)', opacity: '0' },
        },
        'heart-float': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) scale(1.2) rotate(10deg)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(0.5) rotate(20deg)' },
        },
        'fab-pulse-animation': {
          '0%, 100%': { boxShadow: '0 10px 25px rgba(96, 231, 80, 0.3)' },
          '50%': { boxShadow: '0 10px 35px rgba(96, 231, 80, 0.5), 0 0 20px rgba(96, 231, 80, 0.3)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        progressBar: {
          '0%':   { width: '0%', opacity: '1' },
          '80%':  { width: '80%', opacity: '1' },
          '100%': { width: '100%', opacity: '0' },
        },
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'ripple':     'ripple-animation 0.6s ease-out',
        'glow':       'glow-pulse 0.6s ease-out',
        'heart-float':'heart-float 1.2s ease-out forwards',
        'fab-pulse':  'fab-pulse-animation 2s ease-in-out infinite',
        'shimmer':    'shimmer 1.5s ease-in-out infinite',
        'progress-bar':'progressBar 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

