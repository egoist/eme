'use strict'
const webpack = require('webpack')
const config = require('./webpack.config')

config.plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin(),
  /*eslint-disable */
  new webpack.DefinePlugin({
    __DEV__: true,
    'process.env': JSON.stringify('development')
  })
]

module.exports = config
