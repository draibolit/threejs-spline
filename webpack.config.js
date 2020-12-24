const path = require('path');

module.exports = {
  entry: {
    app: './src/index',
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
}
