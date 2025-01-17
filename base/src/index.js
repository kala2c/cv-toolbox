import App from './App.vue';
import { createApp } from 'vue';
import router from './router';

import './styles/index.less';

import './server';

const app = createApp(App);
app.use(router);
app.mount('#app');