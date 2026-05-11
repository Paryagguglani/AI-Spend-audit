/** @type {import('tailwindcss').Config} */
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
        sans: ['system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '14px',
      },
    },
  },
  plugins: [],
}