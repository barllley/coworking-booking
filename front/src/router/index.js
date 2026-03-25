import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true, requiresNotAdmin: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/resources/:id',
      name: 'resource-detail',
      component: () => import('@/views/ResourceDetailView.vue'),
      meta: { requiresAuth: true, requiresNotAdmin: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/AdminDashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/bookings',
      name: 'admin-bookings',
      component: () => import('@/views/AdminBookingsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/resources',
      name: 'admin-resources',
      component: () => import('@/views/AdminResourcesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  // Загружаем пользователя только если есть токен и нет данных
  if (authStore.accessToken && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (err) {
      console.error('Error fetching user in guard:', err)
      authStore.logout()
      return '/login'
    }
  }


  if (to.meta.requiresNotAdmin && authStore.user?.is_staff) {
    return '/admin/dashboard'
  }

  // Проверка авторизации
  if (to.meta.requiresAuth && !authStore.accessToken) {
    return '/login'
  }

  // Проверка прав администратора
  if (to.meta.requiresAdmin && !authStore.user?.is_staff) {
    return '/dashboard'
  }

  return true
})

export default router