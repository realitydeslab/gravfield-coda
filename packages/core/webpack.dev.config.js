const merge = require('webpack-merge');
const common = require('./webpack.common.config.js');

module.exports = merge(common, {
  mode: 'development',
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
  },
  devtool: 'eval-source-map ',
  externals: {
    '@most/core': {
      commonjs: '@most/core',
      commonjs2: '@most/core',
      amd: '@most/core',
      root: '@most/core',
    },
    '@most/scheduler': {
      commonjs: '@most/scheduler',
      commonjs2: '@most/scheduler',
      amd: '@most/scheduler',
      root: '@most/scheduler',
    },
    '@most/dom-event': {
      commonjs: '@most/dom-event',
      commonjs2: '@most/dom-event',
      amd: '@most/dom-event',
      root: '@most/dom-event',
    },
    '@most/prelude': {
      commonjs: '@most/prelude',
      commonjs2: '@most/prelude',
      amd: '@most/prelude',
      root: '@most/prelude',
    },
    '@most/disposable': {
      commonjs: '@most/disposable',
      commonjs2: '@most/disposable',
      amd: '@most/disposable',
      root: '@most/disposable',
    },
    'xebra.js': {
      commonjs: 'xebra.js',
      commonjs2: 'xebra.js',
      amd: 'xebra.js',
      root: 'xebra.js',
    },
    myo: {
      commonjs: 'myo',
      commonjs2: 'myo',
      amd: 'myo',
      root: 'myo',
    },
    tonal: {
      commonjs: 'tonal',
      commonjs2: 'tonal',
      amd: 'tonal',
      root: 'tonal',
    },
  },
});
