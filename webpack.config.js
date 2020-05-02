const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './app/render-app.js',
  output: {
    filename: 'lookout.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    modules: [
      path.resolve(__dirname, 'app'),
      path.resolve(__dirname, 'node_modules')
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // options: {
          //   presets: [
          //     ['stage-0', {exclude: ['transform-regenerator']}],
          //     'react'
          //   ]
          // }
        }
      },
      {
        test: /\.css/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { sourceMap: true } }
        ]
      }
    ]
  },
  devServer: {
    hot: true,
    port: 8080,
    clientLogLevel: 'none',
    open: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
