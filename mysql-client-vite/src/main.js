import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { VxeUI } from 'vxe-pc-ui'

// 导入主题变量，也可以重写主题变量
import 'vxe-table/styles/cssvar.scss'
import 'vxe-pc-ui/styles/cssvar.scss'

// 导入默认的语言
import zhCN from 'vxe-table/es/locale/lang/zh-CN'
VxeUI.setI18n('zh-CN', zhCN)
VxeUI.setLanguage('zh-CN')

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
