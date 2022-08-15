/* eslint-env node */
const webpack = require('webpack')
const { merge } = require('webpack-merge')
const argv = require('yargs').argv
const { version } = require('./package.json')

const commonConfig = {
  entry: './src/index.js',
  devtool: 'source-map',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              minimize: true
            }
          },
          'postcss-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(version),
    }),
    new webpack.BannerPlugin("Built @" + new Date().toUTCString()),
    // new BundleAnalyzerPlugin()
  ],
  optimization: {
    minimize: !argv.watch
  }
}

const umd = merge(commonConfig, {
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
    library: 'danmu.js',
    libraryTarget: 'umd'
  }
})

const client = merge(commonConfig, {
  output: {
    path: `${__dirname}/browser`,
    filename: 'index.js',
    library: 'DanmuJs',
    libraryTarget: 'window'
  }
})

module.exports = [umd, client]
