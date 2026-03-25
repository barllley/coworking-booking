<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useRouter, useRoute } from 'vue-router'
import { LogOut, User, LayoutGrid, Calendar, Home, Sun, Moon } from 'lucide-vue-next'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const router = useRouter()
const route = useRoute()

const isAdmin = computed(() => authStore.user?.is_staff)
const isLanding = computed(() => route.path === '/')

const logout = () => {
  authStore.logout()
}

const goToLanding = () => {
  router.push('/')
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToApp = () => {
  if (authStore.user?.is_staff) {
    router.push('/admin/dashboard')
  } else {
    router.push('/dashboard')
  }
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-brand" @click="goToLanding">
      <span class="logo">CowBook</span>
    </div>
    <div class="navbar-menu">
      <!-- Если это лендинг и пользователь не авторизован -->
      <template v-if="isLanding && !authStore.accessToken">
        <button @click="goToLogin" class="nav-link">Войти</button>
        <button @click="goToRegister" class="nav-link register-btn">Регистрация</button>
      </template>

      <!-- Если пользователь авторизован -->
      <template v-else-if="authStore.accessToken && authStore.user">
        <template v-if="isAdmin">
          <router-link to="/admin/dashboard" class="nav-link">
            <Home :size="18" />
            <span>Дашборд</span>
          </router-link>
          <router-link to="/admin/bookings" class="nav-link">
            <Calendar :size="18" />
            <span>Все брони</span>
          </router-link>
          <router-link to="/admin/resources" class="nav-link">
            <LayoutGrid :size="18" />
            <span>Управление ресурсами</span>
          </router-link>
          <router-link to="/profile" class="nav-link">
            <User :size="18" />
            <span>Мой профиль</span>
          </router-link>
        </template>

        <template v-else>
          <router-link to="/dashboard" class="nav-link">
            <LayoutGrid :size="18" />
            <span>Ресурсы</span>
          </router-link>
          <router-link to="/profile" class="nav-link">
            <User :size="18" />
            <span>Мой профиль</span>
          </router-link>
        </template>

        <button @click="logout" class="nav-link logout-btn">
          <LogOut :size="18" />
          <span>Выйти</span>
        </button>
      </template>

      <template v-else-if="authStore.accessToken && !authStore.user">
        <span class="nav-link loading">Загрузка...</span>
      </template>

      <button @click="toggleTheme" class="nav-link theme-btn">
        <Sun v-if="themeStore.isDark" :size="18" />
        <Moon v-else :size="18" />
        <span>{{ themeStore.isDark ? 'Светлая' : 'Тёмная' }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  width: 100%;
  box-sizing: border-box;
  background: var(--bg-page);
  transition: background-color 0.3s ease;
}

.navbar-brand {
  cursor: pointer;
  transition: opacity 0.2s;
}

.navbar-brand:hover {
  opacity: 0.7;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.navbar-menu {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 40px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-link.router-link-active {
  background: var(--bg-secondary);
  color: var(--accent-gold);
}

.register-btn {
  background: var(--accent-gold);
  color: white;
}

.register-btn:hover {
  background: var(--accent-gold-hover);
  transform: none;
  color: white;
}

.logout-btn:hover {
  background: #ffebee;
  color: #c62828;
}

:root.dark .logout-btn:hover {
  background: #3b1e1e;
  color: #ef9a9a;
}

.theme-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.theme-btn:hover {
  background: var(--bg-secondary);
}

.loading {
  opacity: 0.6;
  cursor: default;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }

  .logo {
    font-size: 22px;
  }

  .navbar-menu {
    justify-content: center;
    gap: 8px;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>