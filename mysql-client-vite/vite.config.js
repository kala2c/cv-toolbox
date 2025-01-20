import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { lazyImport, VxeResolver } from "vite-plugin-lazy-import";
import path from "node:path";

// 获取mode
//
// 通过process.argv获取启动参数

const index = process.argv.indexOf('--mode');
let mode = 'modules';
if (index > -1) {
  mode = process.argv[index + 1];
}
export default defineConfig({
  base: './',
  build: {
    outDir: mode === 'single-app'
        ? path.resolve(__dirname, '../../cv-toolbox-nwjs-sdk', 'package.nw')
        : '../base/package.nw/modules/mysql-client',
  },
  plugins: [
    vue(),
    vueDevTools(),
    lazyImport({
      resolvers: [
        VxeResolver({
          libraryName: 'vxe-table'
        }),
        VxeResolver({
          libraryName: 'vxe-pc-ui'
        })
      ]
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
