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
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#F472B6',
          light: '#F9A8D4',
          dark: '#EC4899',
        },
        accent: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
          dark: '#0891B2',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
        },
        dark: {
          DEFAULT: '#0A0E1A',
          darker: '#050711',
          card: '#1A1F2E',
          hover: '#252B3D',
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
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #F472B6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #F472B6 0%, #06B6D4 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
        'gradient-warm': 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 40px rgba(139, 92, 246, 0.4), 0 0 80px rgba(139, 92, 246, 0.15)',
        'glow-secondary': '0 0 40px rgba(244, 114, 182, 0.4), 0 0 80px rgba(244, 114, 182, 0.15)',
        'glow-accent': '0 0 40px rgba(6, 182, 212, 0.4), 0 0 80px rgba(6, 182, 212, 0.15)',
        'glow-cyan': '0 0 40px rgba(6, 182, 212, 0.4), 0 0 80px rgba(6, 182, 212, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
