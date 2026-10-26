
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#002B5B',
        secondary: '#00AEEF',
        accent: '#F9B115',
      },
    },
  },
  plugins: [],
}
