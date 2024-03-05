/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'PP-dark-blue': '#0b1e32',
        'PP-blue': '#1e3a5b',
        'PP-orange': '#db741f',
        'PP-light-orange': '#ebab59'
      }
    },
  },
  plugins: [],
}

