import { createRouter, createWebHashHistory } from 'vue-router';
// 定义路由
const routes = [
    {
        path: '/',
        name: 'Index',
        component: () => import('../views/Index.vue')
    },
];
// 创建路由实例
const router = createRouter({
    history: createWebHashHistory(),
    routes
});
// 导出路由实例
export default router;