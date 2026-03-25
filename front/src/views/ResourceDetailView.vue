<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResourcesStore } from '@/stores/resources.js'
import { useBookingsStore } from '@/stores/bookings.js'
import { useAuthStore } from '@/stores/auth.js'
import VLoader from '@/components/VLoader.vue'
import NavBar from '@/components/NavBar.vue'
import { ArrowLeft, Calendar, Users } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const resourcesStore = useResourcesStore()
const bookingsStore = useBookingsStore()
const authStore = useAuthStore()

const resourceId = computed(() => route.params.id)
const startTime = ref('')
const endTime = ref('')
const bookingError = ref('')
const bookingSuccess = ref(false)

onMounted(async () => {
  await resourcesStore.fetchResource(resourceId.value)
})

const getCurrentDateTimeLocal = () => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString()
}

const handleBooking = async () => {
  if (!startTime.value || !endTime.value) {
    bookingError.value = 'Выберите дату и время'
    return
  }

  if (new Date(startTime.value) >= new Date(endTime.value)) {
    bookingError.value = 'Время начала должно быть меньше времени окончания'
    return
  }

  if (new Date(startTime.value) < new Date()) {
    bookingError.value = 'Нельзя забронировать на время в прошлом'
    return
  }

  bookingError.value = ''

  try {
    await bookingsStore.addBooking({
      resource: resourceId.value,
      start_time: new Date(startTime.value).toISOString(),
      end_time: new Date(endTime.value).toISOString()
    })
    bookingSuccess.value = true
    setTimeout(() => {
      router.push('/profile')
    }, 2000)
  } catch (err) {
    bookingError.value = err.response?.data?.non_field_errors?.[0] || 'Ошибка бронирования'
  }
}
</script>

<template>
  <div class="resource-detail">
    <NavBar />

    <div class="page-container">
      <button class="back-btn" @click="router.back()">
        <ArrowLeft :size="20" />
        Назад
      </button>

      <VLoader v-if="resourcesStore.loading" />

      <div v-else-if="resourcesStore.currentResource" class="detail-grid">
        <div class="resource-card">
          <h1>{{ resourcesStore.currentResource.name }}</h1>

          <div class="info-list">
            <div class="info-item">
              <div class="info-icon">
                <Users :size="20" />
              </div>
              <div class="info-content">
                <span class="info-label">Вместимость</span>
                <span class="info-value">{{ resourcesStore.currentResource.seats }} {{ resourcesStore.currentResource.seats === 1 ? 'место' : 'места' }}</span>
              </div>
            </div>
          </div>

          <div class="description-block">
            <h3>Описание</h3>
            <p>{{ resourcesStore.currentResource.description || 'Нет описания' }}</p>
          </div>
        </div>

        <div class="booking-card">
          <h2>Забронировать</h2>

          <div v-if="bookingSuccess" class="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Бронирование успешно!
          </div>

          <form v-else @submit.prevent="handleBooking" class="booking-form">
            <div class="form-group">
              <label>Дата и время начала</label>
              <input
                type="datetime-local"
                v-model="startTime"
                :min="getCurrentDateTimeLocal()"
                required
                class="date-input"
              />
            </div>

            <div class="form-group">
              <label>Дата и время окончания</label>
              <input
                type="datetime-local"
                v-model="endTime"
                :min="startTime || getCurrentDateTimeLocal()"
                required
                class="date-input"
              />
            </div>

            <div v-if="bookingError" class="error-message">
              {{ bookingError }}
            </div>

            <button type="submit" :disabled="bookingsStore.loading" class="booking-btn">
              <VLoader v-if="bookingsStore.loading" />
              <span v-else>Забронировать</span>
            </button>
          </form>
        </div>
      </div>

      <div v-else class="not-found-card">
        <p>Ресурс не найден</p>
        <button @click="router.push('/')" class="home-btn">Вернуться на главную</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resource-detail {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background-color: var(--bg-page);
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--text-secondary);
  padding: 8px 16px;
  margin-bottom: 32px;
  border-radius: 40px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--bg-secondary);
  transform: none;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.resource-card {
  background: var(--bg-card);
  border-radius: 28px;
  padding: 32px;
  border: 1px solid var(--border-light);
}

.resource-card h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 28px 0;
  color: var(--text-primary);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-icon {
  width: 44px;
  height: 44px;
  background: var(--bg-secondary);
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-gold);
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.description-block {
  border-top: 1px solid var(--border-light);
  padding-top: 24px;
}

.description-block h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.description-block p {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
}

.booking-card {
  background: var(--bg-card);
  border-radius: 28px;
  padding: 32px;
  border: 1px solid var(--border-light);
}

.booking-card h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: var(--text-primary);
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 14px;
}

.date-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 40px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: var(--bg-page);
  color: var(--text-primary);
  box-sizing: border-box;
}

.date-input:focus {
  outline: none;
  border-color: var(--accent-gold);
}

.booking-btn {
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

.booking-btn:hover:not(:disabled) {
  background: var(--accent-gold-hover);
  transform: none;
}

.booking-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 16px;
  border-radius: 20px;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

:root.dark .success-message {
  background: #1b3b1f;
  color: #81c784;
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

.not-found-card {
  text-align: center;
  padding: 80px 40px;
  background: var(--bg-card);
  border-radius: 28px;
  border: 1px solid var(--border-light);
}

.not-found-card p {
  font-size: 18px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.home-btn {
  background: var(--accent-gold);
  color: white;
  padding: 12px 28px;
  border-radius: 40px;
  font-weight: 500;
  display: inline-block;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.home-btn:hover {
  background: var(--accent-gold-hover);
  transform: none;
}

@media (max-width: 768px) {
  .page-container {
    padding: 24px 20px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .resource-card {
    padding: 24px;
  }

  .resource-card h1 {
    font-size: 28px;
    margin-bottom: 24px;
  }

  .booking-card {
    padding: 24px;
  }

  .booking-card h2 {
    font-size: 22px;
  }

  .info-item {
    gap: 12px;
  }

  .info-icon {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 20px 16px;
  }

  .resource-card h1 {
    font-size: 24px;
  }

  .booking-card h2 {
    font-size: 20px;
  }

  .date-input {
    padding: 10px 14px;
    font-size: 13px;
  }

  .booking-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>