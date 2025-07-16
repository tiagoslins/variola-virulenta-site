/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          'sans': ['Inter', 'sans-serif'], // Tipografia principal para títulos
          'serif': ['Lora', 'serif'], // Tipografia para corpo de texto
        }
      },
    },
    plugins: [
      require('@tailwindcss/typography'), // Plugin para o estilo "prose"
    ],
  }
  