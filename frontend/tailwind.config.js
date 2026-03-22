/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22d3ee',
          light: '#67e8f9',
          dark: '#0891b2',
        },
        secondary: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
        accent: {
          DEFAULT: '#34d399',
          light: '#6ee7b7',
          dark: '#10b981',
        },
        cyan: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
        },
        dark: {
          DEFAULT: '#08111f',
          darker: '#030712',
          card: '#0f172a',
          hover: '#162338',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient': 'gradient-shift 4s ease infinite',
        'orb-pulse': 'orb-pulse 2s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 45%, #0284c7 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f59e0b 0%, #fb923c 50%, #f97316 100%)',
        'gradient-accent': 'linear-gradient(135deg, #34d399 0%, #14b8a6 50%, #06b6d4 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(34, 211, 238, 0.35)',
        'glow-secondary': '0 0 30px rgba(245, 158, 11, 0.28)',
        'glow-accent': '0 0 30px rgba(52, 211, 153, 0.28)',
        'glow-cyan': '0 0 30px rgba(6, 182, 212, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Sora', 'Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
