import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: () => import('../views/Index.vue'),
  },
  {
    path: '/table',
    name: 'Table',
    component: () => import('../views/Table.vue'),
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('../views/Editor.vue'),
  },
  {
    path: '/tree-conn',
    name: 'TreeConn',
    component: () => import('../views/TreeConnTest.vue'),
  },
  {
    path: '/table-viewer',
    name: 'TableViewer',
    component: () => import('../views/TableViewerTest.vue')
  },
  {
    path: '/query-test',
    name: 'QueryTest',
    component: () => import('../views/QueryTest.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
