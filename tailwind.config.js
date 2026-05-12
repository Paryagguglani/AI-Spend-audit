/** @type {import('tailwindcss').Config} */
import animatePlugin from 'tailwindcss-animate'

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: '#FBF8F4',
        cream: '#FFFDF9',
        terracotta: '#C4611A',
        espresso: '#2C1F0E',
        taupe: '#6B5540',
        sand: '#E8E0D4',
        forest: '#3B6D11',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
        '3xl': '24px',
      },
    },
  },
  plugins: [animatePlugin],
}