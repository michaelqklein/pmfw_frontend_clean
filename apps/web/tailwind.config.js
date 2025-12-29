/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',        // App Router files
    './src/components/**/*.{js,ts,jsx,tsx}', // Your components
  ],
  theme: {
    extend: {
      fontFamily: {
        special: ['"Special Elite"', 'cursive'],
        orbitron: ['Orbitron', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
