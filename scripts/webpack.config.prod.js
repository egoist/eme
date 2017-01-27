'use strict'
const webpack = require('webpack')
const config = require('./webpack.config')

config.plugins = config.plugins.concat([
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false
    },
    comments: false
  }),
  new webpack.DefinePlugin({
    '__DEV__': false,
    'process.env.NODE_ENV': JSON.stringify('production')
  })
])

module.exports = config
