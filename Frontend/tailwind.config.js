/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { 
    extend: {
      colors: {
        // Paleta WiiCare
        wiicare: {
          // Azules
          'blue-dark': '#2B4C7E',
          'blue': '#3A6EA5',
          'blue-light': '#5B8BBE',
          'blue-lighter': '#7DA5C8',
          'blue-sky': '#A8C5DB',
          // Beige/Crema
          'beige-dark': '#e6e0d2',
          'beige': '#f5f0e8',
          'beige-light': '#faf8f5',
          // Blancos
          'white': '#ffffff',
          'off-white': '#f8f9fa',
        }
      }
    } 
  },
  plugins: [],
};
