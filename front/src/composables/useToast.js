import { ref } from 'vue'

const toasts = ref([])

let nextId = 0

export const useToast = () => {
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = nextId++
    toasts.value.push({ id, message, type, duration })

    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    showToast,
    removeToast
  }
}