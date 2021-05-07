/* eslint-disable prettier/prettier */
const path = require('path');

module.exports = {
  entry: {
    queue: path.join(__dirname, 'src/queue-index.tsx'),
    appender: path.join(__dirname, 'src/next-in-queue-index.tsx')
  },
  output: {
    path: path.join(__dirname, 'public/'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        exclude: /node_modules/,
        test: /\.(scss|css)$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js', '.scss']
  }
};
