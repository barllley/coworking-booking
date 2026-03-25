<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBookingsStore } from '@/stores/bookings'
import { updateUserWithAvatar } from '@/api/auth'
import VLoader from '@/components/VLoader.vue'
import NavBar from '@/components/NavBar.vue'
import { User, Mail, Phone, Edit2, Check, X, Camera, Calendar, Users } from 'lucide-vue-next'

const authStore = useAuthStore()
const bookingsStore = useBookingsStore()

const isAdmin = computed(() => authStore.user?.is_staff)

const isEditing = ref(false)
const updateLoading = ref(false)
const updateError = ref('')
const updateSuccess = ref(false)

const editForm = ref({
  first_name: '',
  last_name: '',
  email: '',
  profile: {
    phone: ''
  }
})

const avatarFile = ref(null)
const avatarPreview = ref(null)

const myBookings = computed(() =>
  bookingsStore.bookings.filter(b => b.user_details?.id === authStore.user?.id)
)

const activeBookings = computed(() =>
  myBookings.value.filter(b => b.status === 'confirmed' || b.status === 'in_progress')
)

const completedBookings = computed(() =>
  myBookings.value.filter(b => b.status === 'completed')
)

const cancelledBookings = computed(() =>
  myBookings.value.filter(b =>
    b.status === 'cancelled_by_user' ||
    b.status === 'cancelled_by_admin' ||
    b.status === 'no_show'
  )
)

const activeTab = ref('active')

const startEdit = () => {
  editForm.value = {
    first_name: authStore.user?.first_name || '',
    last_name: authStore.user?.last_name || '',
    email: authStore.user?.email || '',
    profile: {
      phone: authStore.user?.profile?.phone || ''
    }
  }
  avatarPreview.value = authStore.user?.profile?.avatar || null
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  updateError.value = ''
  avatarFile.value = null
  avatarPreview.value = authStore.user?.profile?.avatar || null
}

const onAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveProfile = async () => {
  updateLoading.value = true
  updateError.value = ''
  updateSuccess.value = false

  try {
    const dataToSend = {
      first_name: editForm.value.first_name,
      last_name: editForm.value.last_name,
      email: editForm.value.email,
      profile: {
        phone: editForm.value.profile.phone
      }
    }

    if (avatarFile.value) {
      dataToSend.avatar = avatarFile.value
    }

    const updatedUser = await updateUserWithAvatar(dataToSend)
    authStore.user.value = updatedUser

    updateSuccess.value = true
    setTimeout(() => {
      updateSuccess.value = false
      isEditing.value = false
      avatarFile.value = null
    }, 2000)
  } catch (err) {
    console.error('Update error:', err)
    updateError.value = err.response?.data?.detail || 'Ошибка обновления профиля'
  } finally {
    updateLoading.value = false
  }
}

const cancelBooking = async (id) => {
  if (confirm('Вы уверены, что хотите отменить бронь?')) {
    await bookingsStore.cancelBookingById(id)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

const getStatusText = (status) => {
  const map = {
    'confirmed': 'Создано',
    'in_progress': 'В процессе',
    'completed': 'Завершено',
    'cancelled_by_user': 'Отменено вами',
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

onMounted(async () => {
  await bookingsStore.fetchBookings()
})
</script>

<template>
  <div class="profile">
    <NavBar />

    <div class="profile-container">
      <h1>Личный кабинет</h1>

      <!-- Карточка профиля -->
      <div class="profile-card">
        <div class="card-header">
          <h2>Мои данные</h2>
          <button v-if="!isEditing" @click="startEdit" class="edit-btn">
            <Edit2 :size="18" />
            Редактировать
          </button>
        </div>

        <div v-if="!isEditing" class="profile-info">
          <div class="avatar">
            <img v-if="authStore.user?.profile?.avatar" :src="authStore.user.profile.avatar" alt="Avatar">
            <div v-else class="avatar-placeholder">
              {{ authStore.user?.username?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
          </div>

          <div class="info-row">
            <User :size="20" />
            <div>
              <label>Имя и фамилия</label>
              <p>{{ authStore.user?.first_name || 'Не указано' }} {{ authStore.user?.last_name || '' }}</p>
            </div>
          </div>

          <div class="info-row">
            <Mail :size="20" />
            <div>
              <label>Email</label>
              <p>{{ authStore.user?.email || 'Не указан' }}</p>
            </div>
          </div>

          <div class="info-row">
            <Phone :size="20" />
            <div>
              <label>Телефон</label>
              <p>{{ authStore.user?.profile?.phone || 'Не указан' }}</p>
            </div>
          </div>
        </div>

        <div v-else class="profile-edit">
          <div class="avatar-edit">
            <div class="avatar-preview">
              <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar">
              <div v-else class="avatar-placeholder">
                {{ editForm.first_name?.charAt(0) || editForm.last_name?.charAt(0) || 'U' }}
              </div>
            </div>
            <label class="avatar-upload">
              <Camera :size="20" />
              <input type="file" accept="image/*" @change="onAvatarChange" hidden>
              <span>Загрузить фото</span>
            </label>
          </div>

          <div class="edit-field">
            <label>Имя</label>
            <input v-model="editForm.first_name" placeholder="Имя">
          </div>

          <div class="edit-field">
            <label>Фамилия</label>
            <input v-model="editForm.last_name" placeholder="Фамилия">
          </div>

          <div class="edit-field">
            <label>Email</label>
            <input v-model="editForm.email" type="email" placeholder="Email">
          </div>

          <div class="edit-field">
            <label>Телефон</label>
            <input v-model="editForm.profile.phone" placeholder="+7 999 123-45-67">
          </div>

          <div v-if="updateError" class="error-message">{{ updateError }}</div>
          <div v-if="updateSuccess" class="success-message">Профиль обновлён!</div>

          <div class="edit-actions">
            <button @click="saveProfile" :disabled="updateLoading" class="save-btn">
              <Check :size="18" v-if="!updateLoading" />
              <VLoader v-else />
              Сохранить
            </button>
            <button @click="cancelEdit" class="cancel-btn">
              <X :size="18" />
              Отмена
            </button>
          </div>
        </div>
      </div>

      <!-- Список броней -->
      <div v-if="!isAdmin" class="bookings-section">
        <h2>Мои бронирования</h2>

        <VLoader v-if="bookingsStore.loading" />

        <div v-else-if="myBookings.length === 0" class="empty-state">
          <p>У вас пока нет бронирований</p>
          <router-link to="/dashboard" class="link">Перейти к ресурсам</router-link>
        </div>

        <div v-else>
          <div class="tabs">
            <button :class="{ active: activeTab === 'active' }" @click="activeTab = 'active'">
              Активные {{ activeBookings.length }}
            </button>
            <button :class="{ active: activeTab === 'completed' }" @click="activeTab = 'completed'">
              Завершённые {{ completedBookings.length }}
            </button>
            <button :class="{ active: activeTab === 'cancelled' }" @click="activeTab = 'cancelled'">
              Отменённые {{ cancelledBookings.length }}
            </button>
          </div>

          <div class="bookings-list">
            <div
              v-for="booking in activeTab === 'active' ? activeBookings : activeTab === 'completed' ? completedBookings : cancelledBookings"
              :key="booking.id"
              class="booking-card"
            >
              <div class="booking-info">
                <h3>{{ booking.resource_details?.name || 'Ресурс' }}</h3>
                <div class="booking-details">
                  <div class="detail-item">
                    <Calendar :size="16" class="detail-icon" />
                    <span class="time">{{ formatDate(booking.start_time) }} — {{ formatDate(booking.end_time) }}</span>
                  </div>
                  <div class="detail-item">
                    <Users :size="16" class="detail-icon" />
                    <span class="seats">{{ booking.resource_details?.seats }} мест</span>
                  </div>
                </div>
                <p :class="['status', getStatusClass(booking.status)]">
                  {{ getStatusText(booking.status) }}
                </p>
                <p v-if="booking.cancellation_reason" class="reason">
                  Причина: {{ booking.cancellation_reason }}
                </p>
              </div>
              <button
                v-if="booking.status === 'confirmed'"
                @click="cancelBooking(booking.id)"
                class="cancel-booking-btn"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile {
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-page);
  min-height: 100vh;
}

.profile-container {
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

.profile-card {
  background: var(--bg-card);
  border-radius: 28px;
  padding: 32px;
  margin-bottom: 48px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.card-header h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--text-primary);
  padding: 8px 20px;
  border-radius: 40px;
  font-weight: 500;
  border: 1px solid var(--border-light);
}

.edit-btn:hover {
  background: var(--bg-secondary);
  transform: none;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-secondary);
  margin-bottom: 8px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
  background: var(--bg-secondary);
  color: var(--text-muted);
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-light);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.info-row label {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-row p {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0;
  font-weight: 500;
}

.profile-edit {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.avatar-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-secondary);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: var(--bg-secondary);
  border-radius: 40px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  color: var(--text-secondary);
}

.avatar-upload:hover {
  background: var(--border-light);
}

.edit-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 14px;
}

.edit-field input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 40px;
  font-size: 16px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: var(--bg-page);
  color: var(--text-primary);
}

.edit-field input:focus {
  outline: none;
  border-color: var(--accent-gold);
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-gold);
  color: white;
  padding: 12px 24px;
  border-radius: 40px;
  font-weight: 500;
}

.save-btn:hover {
  background: var(--accent-gold-hover);
  transform: none;
}

.cancel-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 12px 24px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.cancel-btn:hover {
  background: var(--border-light);
  transform: none;
}

.bookings-section h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
  color: var(--text-primary);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border-light);
}

.tabs button {
  background: transparent;
  color: var(--text-secondary);
  padding: 12px 24px;
  border-radius: 0;
  font-weight: 500;
  position: relative;
}

.tabs button.active {
  color: var(--accent-gold);
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent-gold);
}

.tabs button:hover {
  background: transparent;
  transform: none;
  color: var(--text-primary);
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.booking-card {
  background: var(--bg-card);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  border: 1px solid var(--border-light);
}

.booking-card:hover {
  box-shadow: var(--shadow-md);
}

.booking-info {
  flex: 1;
}

.booking-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.booking-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.time {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.seats {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
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

.reason {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

.cancel-booking-btn {
  background: #ffebee;
  color: #c62828;
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  margin-left: 16px;
}

:root.dark .cancel-booking-btn {
  background: #3b1e1e;
  color: #ef9a9a;
}

.cancel-booking-btn:hover {
  background: #ffcdd2;
  transform: none;
}

:root.dark .cancel-booking-btn:hover {
  background: #5a2e2e;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border-radius: 24px;
  color: var(--text-muted);
  border: 1px solid var(--border-light);
}

.link {
  display: inline-block;
  margin-top: 16px;
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid var(--accent-gold);
}

.link:hover {
  opacity: 0.7;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
}

:root.dark .error-message {
  background: #3b1e1e;
  color: #ef9a9a;
}

.success-message {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
}

:root.dark .success-message {
  background: #1b3b1f;
  color: #81c784;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 24px 20px;
  }

  h1 {
    font-size: 36px;
    margin-bottom: 32px;
  }

  .profile-card {
    padding: 24px;
  }

  .card-header h2 {
    font-size: 24px;
  }

  .booking-card {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .cancel-booking-btn {
    width: 100%;
    text-align: center;
    margin-left: 0;
  }

  .tabs button {
    padding: 8px 16px;
    font-size: 14px;
  }
}
</style>