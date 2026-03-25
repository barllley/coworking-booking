import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTokenApi, registerApi, getUserApi } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access') || null)
  const refreshToken = ref(localStorage.getItem('refresh') || null)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const login = async (username, password) => {
    loading.value = true
    error.value = null
    try {
      const data = await getTokenApi(username, password)
      accessToken.value = data.access
      refreshToken.value = data.refresh
      localStorage.setItem('access', data.access)
      localStorage.setItem('refresh', data.refresh)
      await fetchUser()
      return true
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка входа'
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (username, password) => {
    loading.value = true
    error.value = null
    try {
      await registerApi(username, password)
      return await login(username, password)
    } catch (err) {
      error.value = err.response?.data?.detail || 'Ошибка регистрации'
      return false
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async () => {
    if (!accessToken.value) return
    try {
      user.value = await getUserApi()
    } catch (err) {
      console.error('Ошибка получения пользователя:', err)
      logout()
    }
  }

  const logout = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    router.push('/')
  }

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    error,
    login,
    register,
    fetchUser,
    logout
  }
})