import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#4C1D95',
          900: '#3B0764',
          deep: '#31124B',
          dark: '#240838',
        },
        primary: {
          DEFAULT: '#4C1D95',
          dark: '#31124B',
          navy: '#240838',
          light: '#FAF5FF',
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#4C1D95',
          600: '#3B0764',
          700: '#31124B',
          800: '#240838',
          900: '#1A0426',
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          dark: '#B45309',
          light: '#FEF3C7',
        },
        text: {
          dark: '#1E1B4B',
          muted: '#6B7280',
          light: '#9CA3AF',
        },
        seat: {
          available: '#FFFFFF',
          selected: '#10B981', // vibrant green
          booked: '#94A3B8',   // slate gray
          ladies: '#EC4899',   // pink
          driver: '#475569',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(49, 18, 75, 0.06)',
        hover: '0 12px 30px -4px rgba(49, 18, 75, 0.12)',
        elevated: '0 20px 40px -8px rgba(49, 18, 75, 0.16)',
        glow: '0 0 25px rgba(126, 34, 206, 0.25)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #240838 0%, #3B0764 50%, #4C1D95 100%)',
        'card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #FAF5FF 100%)',
      }
    },
  },
  plugins: [],
} satisfies Config;
