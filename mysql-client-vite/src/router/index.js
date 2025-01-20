import {createRouter, createWebHashHistory} from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: () => import('../views/Index.vue'),
    },
    {
      path: '/editor',
      name: 'Editor',
      component: () => import('../views/Editor.vue'),
    },
    {
      path: '/table',
      name: 'Table',
      component: () => import('../views/Table.vue'),
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/About.vue'),
    },
  ],
})

export default router
