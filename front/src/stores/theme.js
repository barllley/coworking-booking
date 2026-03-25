import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Получаем сохранённую тему из localStorage
  const savedTheme = localStorage.getItem('theme')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const isDark = ref(savedTheme === 'dark' || (!savedTheme && systemDark))


  watch(isDark, (newValue) => {
    if (newValue) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, { immediate: true })


  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        isDark.value = e.matches
      }
    }
    mediaQuery.addEventListener('change', handleChange)
  })

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleTheme
  }
})