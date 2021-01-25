const path = require('path')

module.exports = {  
  publicPath: './',  
  // 输出文件目录
  outputDir: 'demo',  
  // webpack相关配置
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', path.resolve(__dirname, './src'))
  },
}
