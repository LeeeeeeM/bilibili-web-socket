const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    main: './src/index.js',
    demo: './example/demo.js'
  },
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [{
      test: /\.js/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }]
  },
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    port: '8081',
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './example/demo.html',
      filename: 'index.html',
      inject: 'body',
      chunks: ['main', 'demo']
    })
  ]
}
