import { createRouter, createWebHistory } from 'vue-router'

import { verifyStoredSession } from '@/api/auth'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'

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
          component: () => import('@/views/UsersView.vue'),
        },
        {
          path: 'products',
          name: 'dashboard-products',
          component: () => import('@/views/ProductsView.vue'),
        },
      ],
    },
    { path: '/', redirect: { name: 'dashboard' } },
    { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
  ],
})

router.beforeEach(async (to) => {
  // Validate the stored token with the BE (not just its presence in
  // localStorage) before allowing access. The result is cached per page
  // load, so only the first navigation performs the network check.
  const session = await verifyStoredSession()

  if (!to.meta.public && !session)
    return { name: 'login' }

  if (to.name === 'login' && session)
    return { path: '/dashboard' }

  return true
})

export default router
