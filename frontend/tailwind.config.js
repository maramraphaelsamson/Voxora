/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0284c7', // sky-600
          lightBlue: '#38bdf8', // sky-400
          paleBlue: '#f0f9ff', // sky-50
          dark: '#09090b', // zinc-950 / sleek black
          cardDark: '#18181b', // zinc-900
          pink: '#f43f5e',
          sky: '#0284c7',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
