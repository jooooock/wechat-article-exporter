/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
    debugScreens: {
      position: ['bottom', 'left'],
      style: {
        backgroundColor: 'black',
        color: 'white',
        fontSize: '16px',
        padding: '0.5rem',
        borderRadius: '0.25rem',
      }
    },
  },
  plugins: [
    require('tailwindcss-debug-screens')
  ]
};
