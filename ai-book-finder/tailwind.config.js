/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'weread-bg': '#000000',
        'weread-card': '#2a2a2a',
        'weread-ai': '#4A9EAF',
      }
    },
  },
  plugins: [],
}