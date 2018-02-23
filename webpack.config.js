const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './javascript/app.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: "/"
  },
  devtool: 'source-map',
  resolve: {
    modules: [
      path.resolve(__dirname, 'javascript'),
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
            presets: ['env', 'stage-0', 'react']
          }
        }
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader", options: { sourceMap: true } },
          { loader: "less-loader", options: { sourceMap: true } }
        ]
      },
    ]
  },
  devServer: {
   compress: true,
   hot: true,
  //  noInfo: true,
   historyApiFallback: true,
   port: 7000,
  //  quiet: true,
   clientLogLevel: 'none'
 },
 plugins: [
   new webpack.HotModuleReplacementPlugin()
 ]
}
