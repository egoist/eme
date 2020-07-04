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
    app: './src/index.ts',
    vendor: ['vue', 'vuex']
  },
  output: {
    path: process.cwd() + '/app/libvue',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.css', '.json', '.ts'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      src: path.join(__dirname, '../src'),
      utils: path.join(__dirname, '../src/utils'),
      components: path.join(__dirname, '../src/components'),
      css: path.join(__dirname, '../src/css'),
      directives: path.join(__dirname, '../src/directives'),
      store: path.join(__dirname, '../src/vuex/store')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loaders: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          autoprefixer: false,
          postcss,
          loaders: {
            css: ExtractTextPlugin.extract({
              fallback: 'vue-style-loader',
              use: 'css-loader?sourceMap'
            }
            )
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        exclude: /node_modules/,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract(
          {
            fallback: 'style-loader',
            use: 'css-loader!postcss-loader'
          }
        )
      },
    ],
  },
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
  ],

  devtool: '#eval-source-map'
}
