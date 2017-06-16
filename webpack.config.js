'use strict'

const webpack = require('webpack')
const path = require('path')

module.exports = {
  target: 'electron',
  entry: [
    path.join(__dirname, 'index.js')
  ],
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.json$/, loader: 'json-loader'
    }, {
      test: /\.js$/, loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        cacheDirectory: 'babel_cache',
        presets: ['es2015', 'react']
      }
    }]
  }
}
