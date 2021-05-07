const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  watchOptions: {
    ignored: ['**/node_modules'],
    poll: 1000,
    aggregateTimeout: 100
  }
});
