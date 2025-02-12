const { defineConfig } = require('@vue/cli-service');
// const AutoImport = require('unplugin-auto-import/webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require("node:path");

const index = process.argv.indexOf('--mode');
let mode = 'modules';
if (index > -1) {
  mode = process.argv[index + 1];
}
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  outputDir: mode === 'single-app'
      ? path.resolve(__dirname, '../../cv-toolbox-nwjs-sdk', 'package.nw')
      : '../base/package.nw/modules/db-query',
  configureWebpack: {
    plugins: [
        new MonacoWebpackPlugin({
          languages: ['javascript', 'css', 'html', 'json', 'sql']
        }),
        // AutoImport({
        //   imports: ['vue'],
        //   dts: 'src/auto-import.d.ts',
        // }),
    ]
  },
});
