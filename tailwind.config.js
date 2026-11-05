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
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        cyan: {
          500: '#06B6D4',
          600: '#0891B2',
        },
        violet: {
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        success: {
          500: '#16A34A',
          600: '#15803D',
        },
        danger: {
          500: '#EF4444',
          600: '#DC2626',
        },
        background: {
          primary: '#FFFFFF',
          secondary: '#F5F7FB',
        },
        text: {
          primary: '#111827',
          secondary: '#64748B',
        },
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F3F4F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
      }
    },
  },
  plugins: [],
}
