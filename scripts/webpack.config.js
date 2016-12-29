'use strict'
const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const appPkg = require('../app/package')

const postcss = [
  require('postcss-nested'),
  require('postcss-import')(),
  require('postcss-simple-vars'),
  require('postcss-mixins'),
  require('autoprefixer')({
    browsers: ['last 2 Chrome versions']
  })
]

module.exports = {
  entry: {
    app: ['./src/index.js'],
    vendor: ['vue', 'vuex']
  },
  output: {
    path: process.cwd() + '/app/dist',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['', '.js', '.vue', '.css', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.common.js',
      src: path.join(__dirname, '../src'),
      utils: path.join(__dirname, '../src/utils'),
      components: path.join(__dirname, '../src/components'),
      css: path.join(__dirname, '../src/css'),
      directives: path.join(__dirname, '../src/directives'),
      store: path.join(__dirname, '../src/vuex/store')
    }
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
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader!postcss-loader'
        )
      },
      {
        test: /\.json$/,
        loaders: ['json']
      },
      {
        test: /\.svg$/,
        loaders: ['svg-inline']
      }
    ]
  },
  babel: {
    presets: ['es2015', 'stage-1'],
    plugins: ['transform-runtime']
  },
  vue: {
    autoprefixer: false,
    postcss,
    loaders: {
      css: ExtractTextPlugin.extract(
        'vue-style-loader',
        'css-loader?sourceMap'
      )
    }
  },
  postcss,
  target: 'electron-renderer',
  plugins: [
    new webpack.ExternalsPlugin('commonjs2', [
      './vendor/markdown-it-katex',
      '../package.json'
    ].concat(Object.keys(appPkg.dependencies))),
    new ExtractTextPlugin('[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.js'
    })
  ]
}
