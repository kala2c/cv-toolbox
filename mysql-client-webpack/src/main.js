import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VxeUI from 'vxe-pc-ui'
import VxeUITable from 'vxe-table'
import 'vxe-pc-ui/lib/style.css'
import 'vxe-table/lib/style.css'

createApp(App)
    .use(store)
    .use(router)
    .use(VxeUI)
    .use(VxeUITable)
    .mount('#app')
