const path = require('path');

module.exports = {
  content: [
    path.join(__dirname, './index.html'),
    path.join(__dirname, './src/**/*.{js,jsx,ts,tsx}')
  ],
  css: [path.join(__dirname, './src/styles/**/*.css')],
};