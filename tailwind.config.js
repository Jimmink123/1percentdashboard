/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // indigo-600
          light: '#818CF8', // indigo-400 — brighter, for dark surfaces
          dark: '#818CF8',
          deep: '#3730A3', // indigo-800 — gradient stop / pressed state
        },
        accent: {
          DEFAULT: '#DB2777', // pink-600
          dark: '#F472B6', // pink-400
        },
        // Violet-tinted neutral scale, used instead of plain gray so
        // backgrounds/borders/text carry the same hue as the brand color.
        ink: {
          50: '#F8F7FC',
          100: '#EFEDFA',
          200: '#E1DEF2',
          300: '#C7C1E3',
          400: '#9089B8',
          500: '#726B99',
          600: '#585073',
          700: '#443D5C',
          800: '#211A38',
          900: '#150F26',
          950: '#0B0714',
        },
      },
      fontFamily: {
        sans: ['"Fira Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'row-flash': {
          '0%': { backgroundColor: 'rgba(79, 70, 229, 0.22)' },
          '100%': { backgroundColor: 'rgba(79, 70, 229, 0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        // "backwards" keeps the element hidden during animation-delay instead
        // of flashing at full opacity before the staggered entrance kicks in.
        'fade-in': 'fade-in 550ms cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'row-flash': 'row-flash 1800ms ease-out',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
