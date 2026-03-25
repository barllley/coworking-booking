<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import VLoader from '@/components/VLoader.vue'

const authStore = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают'
    return
  }

  error.value = ''
  const success = await authStore.register(username.value, password.value)
  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>Создать аккаунт</h1>
        <p class="auth-subtitle">Присоединяйтесь к CowBook</p>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div v-if="authStore.error || error" class="error-message">
            {{ authStore.error || error }}
          </div>

          <div class="form-group">
            <input
              type="text"
              v-model="username"
              placeholder="Логин"
              required
              class="auth-input"
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              v-model="password"
              placeholder="Пароль"
              required
              class="auth-input"
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              v-model="confirmPassword"
              placeholder="Подтвердите пароль"
              required
              class="auth-input"
            />
          </div>

          <button type="submit" :disabled="authStore.loading" class="auth-btn">
            <VLoader v-if="authStore.loading" />
            <span v-else>Зарегистрироваться</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Уже есть аккаунт?</p>
          <RouterLink to="/login" class="auth-link">Войти</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px;
  background-color: var(--bg-page);
}

.auth-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.auth-card {
  background: var(--bg-card);
  border-radius: 32px;
  padding: 48px 40px;
  text-align: center;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

h1 {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.auth-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 14px;
  text-align: center;
}

:root.dark .error-message {
  background: #3b1e1e;
  color: #ef9a9a;
}

.form-group {
  width: 100%;
}

.auth-input {
  width: 100%;
  padding: 14px 20px;
  border: 1px solid var(--border-light);
  border-radius: 40px;
  font-size: 16px;
  font-family: inherit;
  transition: all 0.2s;
  background: var(--bg-page);
  color: var(--text-primary);
  box-sizing: border-box;
}

.auth-input:focus {
  outline: none;
  border-color: var(--accent-gold);
}

.auth-input::placeholder {
  color: var(--text-muted);
}

.auth-btn {
  width: 100%;
  background: var(--accent-gold);
  color: white;
  padding: 14px 24px;
  border-radius: 40px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-btn:hover:not(:disabled) {
  background: var(--accent-gold-hover);
  transform: none;
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.auth-footer p {
  margin: 0;
}

.auth-link {
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
}

.auth-link:hover {
  opacity: 0.7;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-card {
    padding: 40px 28px;
  }

  h1 {
    font-size: 32px;
  }

  .auth-subtitle {
    font-size: 14px;
    margin-bottom: 28px;
  }

  .auth-input {
    padding: 12px 18px;
    font-size: 15px;
  }

  .auth-btn {
    padding: 12px 20px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 28px;
  }

  .auth-subtitle {
    font-size: 13px;
    margin-bottom: 24px;
  }

  .auth-input {
    padding: 10px 16px;
    font-size: 14px;
  }

  .auth-btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .auth-footer {
    margin-top: 24px;
    padding-top: 20px;
    font-size: 13px;
  }
}
</style>