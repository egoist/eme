'use strict'
const path = require('path')

module.exports = {
  entry: ['./app/index.js'],
  output: {
    path: process.cwd() + '/electron/dist',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.vue', '.css', '.json'],
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: [/node_modules/]
      },
      {
        test: /\.vue$/,
        loaders: ['vue']
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.json$/,
        loaders: ['json']
      }
    ]
  },
  babel: {
    presets: ['es2015', 'stage-1'],
    plugins: ['transform-runtime']
  },
  vue: {
    autoprefixer: false,
    postcss: [
      require('postcss-nested'),
      require('postcss-simple-vars'),
      require('postcss-import')(),
      require('postcss-mixins')
    ]
  }
}
