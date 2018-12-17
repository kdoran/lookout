const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './app/app.js',
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
          options: {
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/transform-async-to-generator',
              '@babel/plugin-transform-runtime'
            ]
          }
        }
      },
      {
        test: /\.css/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { sourceMap: true } }
        ]
      },
      {
        test: /node_modules/,
        loader: "source-map-loader",
        enforce: "pre"  // This means this is a Prealoader (comes before)
      }
    ]
  },
  devServer: {
    compress: true,
    hot: true,
    historyApiFallback: true,
    port: 8080,
    clientLogLevel: 'none',
    disableHostCheck: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  node: {
    fs: 'empty',
    module: 'empty'
  }
}
