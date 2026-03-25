<script setup>
import { onMounted, ref, computed } from 'vue'
import { useBookingsStore } from '@/stores/bookings'
import { cancelByAdmin } from '@/api/bookings'
import VLoader from '@/components/VLoader.vue'
import Pagination from '@/components/Pagination.vue'
import NavBar from '@/components/NavBar.vue'
import { Filter, X } from 'lucide-vue-next'

const bookingsStore = useBookingsStore()

const statusFilter = ref('all')
const showCancelModal = ref(false)
const selectedBooking = ref(null)
const cancelReason = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filteredBookings = computed(() => {
  let filtered = bookingsStore.bookings

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(b => b.status === statusFilter.value)
  }

  return filtered
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredBookings.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage.value)
})

const totalItems = computed(() => {
  return filteredBookings.value.length
})

const changePage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getStatusText = (status) => {
  const map = {
    'confirmed': 'Подтверждено',
    'in_progress': 'В процессе',
    'completed': 'Завершено',
    'cancelled_by_user': 'Отменено клиентом',
    'cancelled_by_admin': 'Отменено админом',
    'no_show': 'Неявка'
  }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = {
    'confirmed': 'status-confirmed',
    'in_progress': 'status-progress',
    'completed': 'status-completed',
    'cancelled_by_user': 'status-cancelled',
    'cancelled_by_admin': 'status-cancelled',
    'no_show': 'status-no-show'
  }
  return map[status] || ''
}

const openCancelModal = (booking) => {
  if (booking.status === 'completed' || booking.status === 'cancelled_by_user' || booking.status === 'cancelled_by_admin') {
    window.toast?.warning('Нельзя отменить завершённую или уже отменённую бронь')
    return
  }
  selectedBooking.value = booking
  cancelReason.value = ''
  showCancelModal.value = true
}

const handleCancelByAdmin = async () => {
  if (!cancelReason.value.trim()) {
    window.toast?.error('Укажите причину отмены')
    return
  }

  try {
    await cancelByAdmin(selectedBooking.value.id, cancelReason.value)
    await bookingsStore.fetchBookings()
    showCancelModal.value = false
    window.toast?.success('Бронь успешно отменена')
  } catch (err) {
    window.toast?.error('Ошибка при отмене брони')
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

onMounted(async () => {
  await bookingsStore.fetchBookings()
})
</script>

<template>
  <div class="admin-bookings">
    <NavBar />

    <div class="page-container">
      <div class="page-header">
        <h1>Управление бронями</h1>
        <div class="filters">
          <div class="status-filter">
            <Filter :size="18" class="filter-icon" />
            <select v-model="statusFilter" class="status-select">
              <option value="all">Все статусы</option>
              <option value="confirmed">Подтверждено</option>
              <option value="in_progress">В процессе</option>
              <option value="completed">Завершено</option>
              <option value="cancelled_by_user">Отменено клиентом</option>
              <option value="cancelled_by_admin">Отменено админом</option>
              <option value="no_show">Неявка</option>
            </select>
          </div>
        </div>
      </div>

      <VLoader v-if="bookingsStore.loading" />

      <div v-else-if="filteredBookings.length === 0" class="empty-state">
        <p>Брони не найдены</p>
      </div>

      <div v-else>
        <div class="bookings-table-container">
          <table class="bookings-table">
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Ресурс</th>
                <th>Начало</th>
                <th>Конец</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="booking in paginatedBookings" :key="booking.id">
                <td class="username-cell">{{ [booking.user_details?.first_name, booking.user_details?.last_name].filter(Boolean).join(' ') || '—' }}</td>
                <td class="resource-cell">{{ booking.resource_details?.name }}</td>
                <td class="date-cell">{{ formatDate(booking.start_time) }}</td>
                <td class="date-cell">{{ formatDate(booking.end_time) }}</td>
                <td>
                  <span :class="['status-badge', getStatusClass(booking.status)]">
                    {{ getStatusText(booking.status) }}
                  </span>
                </td>
                <td class="actions">
                  <button
                    v-if="booking.status === 'confirmed' || booking.status === 'in_progress'"
                    @click="openCancelModal(booking)"
                    class="btn-cancel"
                  >
                    Отменить
                  </button>
                  <span v-else class="no-action">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Pagination
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          @page-change="changePage"
        />
      </div>
    </div>

    <!-- Модальное окно отмены -->
    <div v-if="showCancelModal" class="modal" @click.self="showCancelModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Отмена брони</h3>
          <button class="close-btn" @click="showCancelModal = false">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">Клиент:</span>
              <span class="detail-value">{{ [selectedBooking?.user_details?.first_name, selectedBooking?.user_details?.last_name].filter(Boolean).join(' ') || selectedBooking?.user_details?.username || '—' }}</span>
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
.admin-bookings {
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--text-primary);
}

.filters {
  display: flex;
  gap: 16px;
}

.status-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-card);
  padding: 8px 20px;
  border-radius: 40px;
  border: 1px solid var(--border-light);
}

.filter-icon {
  color: var(--text-muted);
}

.status-select {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  padding: 4px;
  font-weight: 500;
}

.status-select:hover {
  opacity: 0.7;
}

.bookings-table-container {
  background: var(--bg-card);
  border-radius: 28px;
  overflow-x: auto;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
}

.bookings-table th,
.bookings-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.bookings-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-muted);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bookings-table tr:hover {
  background: var(--bg-secondary);
}

.id-cell {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
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

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-confirmed { background: #e3f2fd; color: #1976d2; }
.status-progress { background: #fff3e0; color: #ff9800; }
.status-completed { background: #e8f5e9; color: #2e7d32; }
.status-cancelled { background: #ffebee; color: #c62828; }
.status-no-show { background: #f3e5f5; color: #7b1fa2; }

:root.dark .status-confirmed { background: #1a3a5a; color: #64b5f6; }
:root.dark .status-progress { background: #3d2e1a; color: #ffb74d; }
:root.dark .status-completed { background: #1b3b1f; color: #81c784; }
:root.dark .status-cancelled { background: #3b1e1e; color: #ef9a9a; }
:root.dark .status-no-show { background: #2d1b3a; color: #ce93d8; }

.actions {
  white-space: nowrap;
}

.btn-cancel {
  background: #ffebee;
  color: #c62828;
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

:root.dark .btn-cancel {
  background: #3b1e1e;
  color: #ef9a9a;
}

.btn-cancel:hover {
  background: #ffcdd2;
  transform: none;
}

:root.dark .btn-cancel:hover {
  background: #5a2e2e;
}

.no-action {
  color: var(--text-muted);
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--bg-card);
  border-radius: 28px;
  color: var(--text-muted);
  font-size: 16px;
  border: 1px solid var(--border-light);
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
  width: 90%;
  max-width: 500px;
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
  border: none;
  cursor: pointer;
  transition: all 0.2s;
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
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-modal:hover {
  background: var(--border-light);
  transform: none;
}

@media (max-width: 768px) {
  .page-container {
    padding: 24px 20px;
  }

  .page-header h1 {
    font-size: 36px;
  }

  .status-filter {
    padding: 6px 16px;
  }

  .bookings-table th,
  .bookings-table td {
    padding: 12px;
  }

  .btn-cancel {
    padding: 6px 12px;
    font-size: 12px;
  }

  .modal-header {
    padding: 20px;
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

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filters {
    width: 100%;
  }

  .status-filter {
    width: 100%;
    justify-content: space-between;
  }

  .status-select {
    flex: 1;
  }
}
</style>