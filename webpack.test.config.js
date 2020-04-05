const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './tests/run-tests.js',
  output: {
    filename: 'tests.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/'
  },
  mode: 'development',
  devtool: 'source-map',
  resolve: {
    modules: [
      path.resolve(__dirname, './node_modules')
    ]
  },
  devServer: {
    hot: true,
    port: 5555,
    liveReload: true,
    clientLogLevel: 'none'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.TEST_URL': JSON.stringify(process.env.TEST_URL || 'http://localhost:5984'),
      'process.env.TEST_USERNAME': JSON.stringify(process.env.TEST_USERNAME || 'admin'),
      'process.env.TEST_PASSWORD': JSON.stringify(process.env.TEST_PASSWORD || 'admin')
    })
  ]
}
