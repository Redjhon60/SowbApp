/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: { DEFAULT: '#f97316' },
        gold: { DEFAULT: '#b8975a' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        arabic: ['Amiri', 'serif'],
      },
    },
  },
  plugins: [],
};
