const path = require('path')
const webpack = require('webpack')
const resolve = dir => path.join(__dirname, dir)
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  devServer: {
    port: 8200
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
    // 修复HMR 热更新失效
    config.resolve.symlinks(true)
  }
}
