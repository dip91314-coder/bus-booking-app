import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1746C8',
          dark: '#0C247A',
          navy: '#071A4D',
          light: '#EEF4FF',
          50: '#F0F5FF',
          100: '#E0EBFF',
          200: '#C2D7FF',
          300: '#99BEFF',
          400: '#5F99FF',
          500: '#1746C8',
          600: '#113BB3',
          700: '#0C247A',
          800: '#0A1C5A',
          900: '#071A4D',
        },
        accent: {
          DEFAULT: '#FF8A32',
          hover: '#FF7510',
          dark: '#E06400',
          light: '#FFF2E6',
        },
        text: {
          dark: '#17233D',
          muted: '#718096',
          light: '#A0AEC0',
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
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(7, 26, 77, 0.08)',
        hover: '0 12px 30px -4px rgba(7, 26, 77, 0.14)',
        elevated: '0 20px 40px -8px rgba(7, 26, 77, 0.2)',
        glow: '0 0 25px rgba(255, 138, 50, 0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #071A4D 0%, #0C247A 50%, #1746C8 100%)',
        'card-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        'badge-gradient': 'linear-gradient(90deg, #FF8A32 0%, #FFA860 100%)',
      }
    },
  },
  plugins: [],
} satisfies Config;
