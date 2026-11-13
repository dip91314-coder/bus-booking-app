/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6', // Primary Brand Purple
          900: '#4C1D95',
          950: '#2E1065',
        },
        navy: {
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        surface: {
          white: '#FFFFFF',
          alt: '#F8F7FC',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'soft-hover': '0 16px 36px -4px rgba(15, 23, 42, 0.12), 0 6px 14px -2px rgba(15, 23, 42, 0.06)',
        'floating-search': '0 12px 40px rgba(91, 33, 182, 0.15)',
        'glow-purple': '0 4px 20px rgba(124, 58, 237, 0.35)',
      },
      borderRadius: {
        sm: 'var(--radius-sm, 10px)',
        md: 'var(--radius-md, 16px)',
        lg: 'var(--radius-lg, 24px)',
        xl: 'var(--radius-xl, 32px)',
        full: 'var(--radius-full, 999px)',
      }
    },
  },
  plugins: [],
};
