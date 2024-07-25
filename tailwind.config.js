/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
    debugScreens: {
      position: ['top', 'left'],
      style: {
        backgroundColor: 'black',
        color: 'white',
        fontSize: '14px'
      }
    },
  },
  plugins: [
    require('tailwindcss-debug-screens')
  ]
};
