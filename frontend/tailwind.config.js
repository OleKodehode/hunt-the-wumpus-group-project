/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'cherry': ['Black Chancery', 'sans-serif'],
      },
      colors: {
        'green-500': '#22c55e', // Adding a green color for consistency, adjust if a different shade is desired
      },
    },
  },
  plugins: [],
}