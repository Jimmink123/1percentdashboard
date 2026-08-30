/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12141a',
        paper: '#f7f7f5',
      },
    },
  },
  plugins: [],
}
