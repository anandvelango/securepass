/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#10161D', // new background color
        'primary': '#102040',     // deep blue (optional secondary)
        'card-bg': '#18202B',    // slightly lighter for cards/forms
      },
    },
  },
  plugins: [],
};
