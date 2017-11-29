const path = require('path');

const config = {
  entry: './entry.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js'
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