/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tea: {
          ink: '#1f3529',
          forest: '#173f31',
          paper: '#f8f6f0',
          clay: '#a65336',
        },
      },
    },
  },
  plugins: [],
};
