import { createRouter, createWebHistory } from 'vue-router'

import { verifyStoredSession } from '@/api/auth'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import LoginView from '@/views/auth/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      children: [
        { path: '', redirect: { name: 'dashboard-users' } },
        {
          path: 'users',
          name: 'dashboard-users',
          component: () => import('@/views/users/UsersView.vue'),
        },
        {
          path: 'products',
          name: 'dashboard-products',
          component: () => import('@/views/products/ProductsView.vue'),
        },
        {
          path: 'categories',
          name: 'dashboard-categories',
          component: () => import('@/views/categories/CategoriesView.vue'),
        },
        {
          path: 'statistics',
          name: 'dashboard-statistics',
          component: () => import('@/views/statistics/StatisticsView.vue'),
        },
      ],
    },
    { path: '/', redirect: { name: 'dashboard' } },
    { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
  ],
})

router.beforeEach(async (to) => {
  const session = await verifyStoredSession()

  if (!to.meta.public && !session)
    return { name: 'login' }

  if (to.name === 'login' && session)
    return { path: '/dashboard' }

  return true
})

export default router

