<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { ref, onMounted } from 'vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const toastMessage = ref('')
const toastType = ref('success')
const showToast = ref(false)
let toastTimeout = null

const displayToast = (message, type = 'success') => {
  if (toastTimeout) clearTimeout(toastTimeout)
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  toastTimeout = setTimeout(() => {
    showToast.value = false
  }, 3000)
}

window.toast = {
  success: (msg) => displayToast(msg, 'success'),
  error: (msg) => displayToast(msg, 'error'),
  info: (msg) => displayToast(msg, 'info'),
  warning: (msg) => displayToast(msg, 'warning')
}

onMounted(async () => {
  if (authStore.accessToken) {
    try {
      await authStore.fetchUser()
    } catch (err) {
      console.error('Error fetching user on mount:', err)
      authStore.logout()
    }
  }
})
</script>

<template>
  <RouterView />

  <transition name="toast">
    <div v-if="showToast" :class="['toast', `toast-${toastType}`]" @click="showToast = false">
      <span class="toast-message">{{ toastMessage }}</span>
      <button class="toast-close">&times;</button>
    </div>
  </transition>
</template>

<style>
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  z-index: 10000;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: #4caf50;
  color: white;
}

.toast-error {
  background: #f44336;
  color: white;
}

.toast-info {
  background: #2196f3;
  color: white;
}

.toast-warning {
  background: #ff9800;
  color: white;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  opacity: 0.7;
}

.toast-close:hover {
  opacity: 1;
  transform: none;
  background: none;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>