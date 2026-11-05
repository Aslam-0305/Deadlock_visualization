/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          darkest:  '#162623',  // sidebar bg, logo area
          dark:     '#295255',  // primary buttons, active nav, key accents
          mid:      '#577877',  // secondary elements, borders, hover
          lightest: '#F0F5F7',  // page bg, card bg, inputs
        },
        primary: {
          50:  '#EBF2F2',
          100: '#C9DEDE',
          200: '#A4C8C8',
          300: '#7CB0B0',
          400: '#5A9696',
          500: '#3D7A7A',
          600: '#295255',   // main primary = brand.dark
          700: '#1E3D40',
          800: '#162623',   // darkest = brand.darkest
          900: '#0F1A18',
        },
        success: {
          500: '#16A34A',
          600: '#15803D',
        },
        danger: {
          500: '#EF4444',
          600: '#DC2626',
          200: '#FECACA',
        },
        warning: {
          500: '#F59E0B',
          600: '#D97706',
        },
        background: {
          primary:   '#F0F5F7',   // brand.lightest — page bg
          secondary: '#E4ECEE',   // slightly deeper for hover/cards
          card:      '#FFFFFF',   // white cards on the light bg
        },
        text: {
          primary:   '#162623',   // brand.darkest — headings
          secondary: '#577877',   // brand.mid — body/labels
          muted:     '#8AABA9',   // lighter labels
        },
        border: {
          DEFAULT: '#C8D8DA',
          light:   '#DDE8EA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':       '0 1px 4px 0 rgba(22,38,35,0.08), 0 1px 2px -1px rgba(22,38,35,0.06)',
        'card-hover': '0 6px 16px -4px rgba(41,82,85,0.18), 0 2px 6px -2px rgba(41,82,85,0.1)',
        'sidebar':    '2px 0 12px rgba(22,38,35,0.12)',
      },
      borderRadius: {
        'card':    '12px',
        'card-lg': '16px',
      },
    },
  },
  plugins: [],
}
