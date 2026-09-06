/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        thai: ['Kanit', 'Prompt', 'sans-serif'],
        sans: ['Inter', 'Kanit', 'sans-serif']
      },
      colors: {
        brand: {
          dark: '#0a0d14',
          surface: '#121722',
          card: '#1a202c',
          accent: '#795290',
          rose: '#e06c75',
          gold: '#e5c07b',
          cyan: '#56b6c2'
        }
      }
    },
  },
  plugins: [],
}
