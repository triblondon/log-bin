const path = require('path');

module.exports = {
  mode: 'production',
  context: path.join(__dirname, './client/'),
  entry: './app.jsx',
  output: {
    path: path.join(__dirname, 'client/public'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'jsx-loader',
        exclude: /node_modules/,
        include: path.join(__dirname, 'client'),
      },
    ],
  },
};