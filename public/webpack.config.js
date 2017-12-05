const path = require('path');

const config = {
  entry: {
    origin: './entry.v1.js',
    mediasoup: './entry.v2.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /(node_modules)/,
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['env']
      //     }
      //   }
      // }
    ]
  }
};

module.exports = config;