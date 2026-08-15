/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F5F7FA',
          dark: '#0B132B',
          cardLight: '#FFFFFF',
          cardDark: '#1C2541'
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#1E293B',
          900: '#0F172A',
          950: '#0A0F1D',
        },
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
          dark: '#1E40AF'
        },
        income: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
          dark: '#059669'
        },
        expense: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
          dark: '#DC2626'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB',
          dark: '#D97706'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
