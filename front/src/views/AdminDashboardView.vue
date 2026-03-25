<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useBookingsStore } from '@/stores/bookings.js'
import { $authHost } from '@/api/index.js'
import { markArrived, cancelByAdmin } from '@/api/bookings.js'
import VLoader from '@/components/VLoader.vue'
import NavBar from '@/components/NavBar.vue'
import { Users, LayoutGrid, Calendar, Clock } from 'lucide-vue-next'

const authStore = useAuthStore()
const bookingsStore = useBookingsStore()

const cancelReason = ref('')
const showCancelModal = ref(false)
const selectedBooking = ref(null)

// Все ресурсы (для статистики)
const allResources = ref([])

const currentBookings = computed(() =>
  bookingsStore.bookings.filter(b =>
    (b.status === 'confirmed' || b.status === 'in_progress') &&
    new Date(b.start_time) <= new Date()
  )
)

const stats = computed(() => ({
  totalResources: allResources.value.length,
  activeResources: allResources.value.filter(r => r.is_active).length,
  todayBookings: bookingsStore.bookings.filter(b => {
    const today = new Date().toDateString()
    return new Date(b.start_time).toDateString() === today
  }).length,
  currentBookings: currentBookings.value.length
}))

// Загрузка всех ресурсов через $authHost
const fetchAllResources = async () => {
  try {
    const { data } = await $authHost.get('/resources')
    allResources.value = data
  } catch (err) {
    console.error('Ошибка загрузки ресурсов:', err)
  }
}

const handleMarkArrived = async (bookingId) => {
  if (confirm('Отметить, что клиент пришёл?')) {
    try {
      await markArrived(bookingId)
      await bookingsStore.fetchBookings()
    } catch (err) {
      alert('Ошибка при отметке явки')
    }
  }
}

const openCancelModal = (booking) => {
  selectedBooking.value = booking
  cancelReason.value = ''
  showCancelModal.value = true
}

const handleCancelByAdmin = async () => {
  if (!cancelReason.value.trim()) {
    alert('Укажите причину отмены')
    return
  }

  try {
    await cancelByAdmin(selectedBooking.value.id, cancelReason.value)
    await bookingsStore.fetchBookings()
    showCancelModal.value = false
  } catch (err) {
    alert('Ошибка при отмене брони')
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(async () => {
  await Promise.all([
    bookingsStore.fetchBookings(),
    fetchAllResources()
  ])
})
</script>

<template>
  <div class="admin-dashboard">
    <NavBar />

    <div class="page-container">
      <h1>Административная панель</h1>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <LayoutGrid :size="28" class="stat-icon" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.totalResources }}</span>
            <span class="stat-label">Всего ресурсов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <Users :size="28" class="stat-icon" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.activeResources }}</span>
            <span class="stat-label">Активных ресурсов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <Calendar :size="28" class="stat-icon" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.todayBookings }}</span>
            <span class="stat-label">Броней сегодня</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrapper">
            <Clock :size="28" class="stat-icon" />
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ stats.currentBookings }}</span>
            <span class="stat-label">Текущих броней</span>
          </div>
        </div>
      </div>

      <div class="current-bookings">
        <h2>Текущие брони</h2>

        <VLoader v-if="bookingsStore.loading" />

        <div v-else-if="currentBookings.length === 0" class="empty-state">
          <p>Нет активных броней</p>
        </div>

        <div v-else class="bookings-table-container">
          <table class="bookings-table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Ресурс</th>
                <th>Время начала</th>
                <th>Время окончания</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in currentBookings" :key="booking.id">
                <td class="username-cell">{{ [booking.user_details?.first_name, booking.user_details?.last_name].filter(Boolean).join(' ') || '—' }}</td>
                <td class="resource-cell">{{ booking.resource_details?.name }}</td>
                <td class="date-cell">{{ formatDate(booking.start_time) }}</td>
                <td class="date-cell">{{ formatDate(booking.end_time) }}</td>
                <td>
                  <span :class="['status-badge', booking.status === 'confirmed' ? 'status-waiting' : 'status-progress']">
                    {{ booking.status === 'confirmed' ? 'Ожидает' : 'В процессе' }}
                  </span>
                </td>
                <td class="actions">
                  <button
                    v-if="booking.status === 'confirmed'"
                    @click="handleMarkArrived(booking.id)"
                    class="btn-arrive">
                    Подтвердить
                  </button>
                  <button @click="openCancelModal(booking)" class="btn-cancel">
                    Отменить
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Модальное окно отмены -->
    <div v-if="showCancelModal" class="modal" @click.self="showCancelModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Отмена брони</h3>
          <button class="close-btn" @click="showCancelModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">Клиент:</span>
              <span class="detail-value">{{ selectedBooking?.user_details?.username }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ресурс:</span>
              <span class="detail-value">{{ selectedBooking?.resource_details?.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Время:</span>
              <span class="detail-value">{{ formatDate(selectedBooking?.start_time) }} — {{ formatDate(selectedBooking?.end_time) }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Причина отмены <span class="required">*</span></label>
            <textarea
              v-model="cancelReason"
              rows="3"
              placeholder="Укажите причину отмены..."
              class="reason-input"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="handleCancelByAdmin" class="btn-confirm">Подтвердить отмену</button>
          <button @click="showCancelModal = false" class="btn-cancel-modal">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
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

h1 {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 24px;
  padding: 16px 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.2s;
  border: 1px solid var(--border-light);
}

.stat-card:hover {
  background: var(--bg-secondary);
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--bg-page);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  color: var(--accent-gold);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 36px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 4px;
}

.current-bookings {
  background: var(--bg-card);
  border-radius: 28px;
  padding: 32px;
  border: 1px solid var(--border-light);
}

.current-bookings h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 28px;
  color: var(--text-primary);
}

.bookings-table-container {
  overflow-x: auto;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table th,
.bookings-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.bookings-table th {
  background: transparent;
  font-weight: 600;
  color: var(--text-muted);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bookings-table tr:hover {
  background: var(--bg-secondary);
}

.username-cell {
  font-weight: 600;
  color: var(--text-primary);
}

.resource-cell {
  color: var(--text-secondary);
}

.date-cell {
  color: var(--text-muted);
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 10px;
  white-space: nowrap;
}

.btn-arrive {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
}

:root.dark .btn-arrive {
  background: #1b3b1f;
  color: #81c784;
}

.btn-arrive:hover {
  background: #c8e6c9;
}

:root.dark .btn-arrive:hover {
  background: #2e5a32;
}

.btn-cancel {
  background: #ffebee;
  color: #c62828;
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
}

:root.dark .btn-cancel {
  background: #3b1e1e;
  color: #ef9a9a;
}

.btn-cancel:hover {
  background: #ffcdd2;
}

:root.dark .btn-cancel:hover {
  background: #5a2e2e;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-waiting {
  background: #fff3e0;
  color: #ff9800;
}

:root.dark .status-waiting {
  background: #3d2e1a;
  color: #ffb74d;
}

.status-progress {
  background: #e3f2fd;
  color: #1976d2;
}

:root.dark .status-progress {
  background: #1a3a5a;
  color: #64b5f6;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 16px;
}

/* Модальное окно */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-card);
  border-radius: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40px;
  color: var(--text-muted);
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  transform: none;
}

.modal-body {
  padding: 28px;
}

.booking-details {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  width: 60px;
  font-weight: 500;
  color: var(--text-muted);
  font-size: 14px;
}

.detail-value {
  flex: 1;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-group {
  margin-top: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 14px;
}

.required {
  color: #c62828;
}

:root.dark .required {
  color: #ef9a9a;
}

.reason-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.2s;
  background: var(--bg-page);
  color: var(--text-primary);
}

.reason-input:focus {
  outline: none;
  border-color: var(--accent-gold);
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 28px 28px;
  border-top: 1px solid var(--border-light);
}

.btn-confirm {
  background: #c62828;
  color: white;
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
}

.btn-confirm:hover {
  background: #b71c1c;
  transform: none;
}

.btn-cancel-modal {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
}

.btn-cancel-modal:hover {
  background: var(--border-light);
  transform: none;
}

@media (max-width: 768px) {
  .page-container {
    padding: 24px 20px;
  }

  h1 {
    font-size: 36px;
    margin-bottom: 32px;
  }

  .stats-grid {
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-value {
    font-size: 28px;
  }

  .current-bookings {
    padding: 24px;
  }

  .current-bookings h2 {
    font-size: 24px;
  }

  .bookings-table th,
  .bookings-table td {
    padding: 12px;
  }

  .actions {
    flex-direction: column;
    gap: 6px;
  }

  .btn-arrive,
  .btn-cancel {
    padding: 6px 12px;
    font-size: 12px;
  }

  .modal-header h3 {
    font-size: 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 16px 20px 20px;
  }
}
</style>