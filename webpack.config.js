const polyfill = []

const umd = {
  entry: polyfill.concat(['./src/index.js']),
  devtool: 'source-map',
  output: {
    path: `${__dirname}/dist`,
    filename: 'index.js',
    library: 'danmu.js',
    libraryTarget: 'umd'
  },
  mode: 'production',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            minimize: false
          }
        },
        'postcss-loader',
        'sass-loader'
      ]
    }]
  },
  optimization: {
    minimize: false
  }
}

const client = {
  entry: polyfill.concat(['./src/index.js']),
  devtool: 'source-map',
  output: {
    path: `${__dirname}/browser`,
    filename: 'index.js',
    library: 'DanmuJs',
    libraryTarget: 'window'
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            minimize: false
          }
        },
        'postcss-loader',
        'sass-loader'
      ]
    }]
  },
  mode: 'production',
  optimization: {
    minimize: false
  }
}

module.exports = [umd, client]
