<script setup>
import { onMounted, ref, computed } from 'vue'
import { $authHost } from '@/api/index'
import { createResource, updateResource, deleteResource } from '@/api/resources'
import VLoader from '@/components/VLoader.vue'
import Pagination from '@/components/Pagination.vue'
import NavBar from '@/components/NavBar.vue'
import { Plus, Edit2, Trash2, X, Check, Power, PowerOff } from 'lucide-vue-next'

const allResources = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const currentResource = ref(null)
const formData = ref({
  name: '',
  seats: '',
  description: '',
  is_active: true
})
const saving = ref(false)

// Пагинация
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Пагинированные ресурсы
const paginatedResources = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return allResources.value.slice(start, end)
})

// Общее количество страниц
const totalPages = computed(() => {
  return Math.ceil(allResources.value.length / itemsPerPage.value)
})

// Общее количество записей
const totalItems = computed(() => {
  return allResources.value.length
})

// Смена страницы
const changePage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Загрузка всех ресурсов через $authHost
const fetchAllResources = async () => {
  loading.value = true
  try {
    const { data } = await $authHost.get('/resources')
    allResources.value = data
    console.log('Загружено ресурсов:', allResources.value.length)
    console.log('Активных:', allResources.value.filter(r => r.is_active).length)
    console.log('Неактивных:', allResources.value.filter(r => !r.is_active).length)
  } catch (err) {
    console.error('Ошибка загрузки:', err)
    window.toast?.error('Ошибка загрузки ресурсов')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  currentResource.value = null
  formData.value = {
    name: '',
    seats: '',
    description: '',
    is_active: true
  }
  showModal.value = true
}

const openEditModal = (resource) => {
  isEditing.value = true
  currentResource.value = resource
  formData.value = {
    name: resource.name,
    seats: resource.seats,
    description: resource.description || '',
    is_active: resource.is_active
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (!formData.value.name.trim()) {
    window.toast?.error('Введите название ресурса')
    return
  }

  if (!formData.value.seats || formData.value.seats < 1) {
    window.toast?.error('Введите корректное количество мест')
    return
  }

  saving.value = true

  try {
    if (isEditing.value) {
      await updateResource(currentResource.value.id, formData.value)
      window.toast?.success('Ресурс успешно обновлён')
    } else {
      await createResource(formData.value)
      window.toast?.success('Ресурс успешно создан')
    }
    await fetchAllResources()
    closeModal()
  } catch (err) {
    console.error('Ошибка сохранения:', err)
    window.toast?.error('Ошибка при сохранении ресурса')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (resource) => {
  if (confirm(`Удалить ресурс "${resource.name}"?`)) {
    try {
      await deleteResource(resource.id)
      await fetchAllResources()
      window.toast?.success('Ресурс успешно удалён')
    } catch (err) {
      window.toast?.error('Ошибка при удалении ресурса')
    }
  }
}

const toggleActive = async (resource) => {
  try {
    const newStatus = !resource.is_active
    await updateResource(resource.id, { is_active: newStatus })
    await fetchAllResources()
    window.toast?.success(`Ресурс "${resource.name}" ${newStatus ? 'активирован' : 'деактивирован'}`)
  } catch (err) {
    window.toast?.error('Ошибка при изменении статуса')
  }
}

onMounted(async () => {
  await fetchAllResources()
})
</script>

<template>
  <div class="admin-resources">
    <NavBar />

    <div class="page-container">
      <div class="page-header">
        <h1>Управление ресурсами</h1>
        <button class="btn-create" @click="openCreateModal">
          <Plus :size="18" />
          Добавить ресурс
        </button>
      </div>

      <div class="stats-bar">
        <span class="stat-item">Всего {{ allResources.length }}</span>
        <span class="stat-item active">Активных {{ allResources.filter(r => r.is_active).length }}</span>
        <span class="stat-item inactive">Неактивных {{ allResources.filter(r => !r.is_active).length }}</span>
      </div>

      <VLoader v-if="loading" />

      <div v-else-if="allResources.length === 0" class="empty-state">
        <p>Ресурсы не найдены</p>
        <button @click="openCreateModal" class="btn-create-empty">Создать первый ресурс</button>
      </div>

      <div v-else>
        <div class="resources-table-container">
          <table class="resources-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Мест</th>
                <th>Описание</th>
                <th>Статус</th>
                <th>Создан</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="resource in paginatedResources" :key="resource.id">
                <td class="resource-name">{{ resource.name }}</td>
                <td>{{ resource.seats }}</td>
                <td class="description-cell">{{ resource.description || '—' }}</td>
                <td>
                  <span :class="['status-badge', resource.is_active ? 'status-active' : 'status-inactive']">
                    {{ resource.is_active ? 'Активен' : 'Неактивен' }}
                  </span>
                </td>
                <td class="date-cell">{{ new Date(resource.created_at).toLocaleDateString() }}</td>
                <td class="actions">
                  <button
                    @click="toggleActive(resource)"
                    :class="['action-btn', resource.is_active ? 'btn-deactivate' : 'btn-activate']"
                    :title="resource.is_active ? 'Деактивировать' : 'Активировать'"
                  >
                    <Power v-if="resource.is_active" :size="16" />
                    <PowerOff v-else :size="16" />
                  </button>

                  <button @click="openEditModal(resource)" class="action-btn btn-edit" title="Редактировать">
                    <Edit2 :size="16" />
                  </button>

                  <button @click="handleDelete(resource)" class="action-btn btn-delete" title="Удалить">
                    <Trash2 :size="16" />
                  </button>
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

    <!-- Модальное окно создания/редактирования -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Редактировать ресурс' : 'Создать ресурс' }}</h3>
          <button class="close-btn" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Название <span class="required">*</span></label>
            <input v-model="formData.name" type="text" placeholder="Например: Стол у окна" />
          </div>

          <div class="form-group">
            <label>Количество мест <span class="required">*</span></label>
            <input v-model="formData.seats" type="number" min="1" placeholder="1" />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="formData.description" rows="3" placeholder="Опишите особенности ресурса..."></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.is_active" />
              <span>Ресурс активен (доступен для бронирования)</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="handleSubmit" :disabled="saving" class="btn-save">
            <Check :size="16" v-if="!saving" />
            <VLoader v-else />
            {{ isEditing ? 'Сохранить' : 'Создать' }}
          </button>
          <button @click="closeModal" class="btn-cancel-modal">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-resources {
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
  margin-bottom: 16px;
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

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-gold);
  color: white;
  padding: 12px 24px;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover {
  background: var(--accent-gold-hover);
  transform: none;
}

.stats-bar {
  background: var(--bg-card);
  padding: 16px 24px;
  border-radius: 28px;
  margin-bottom: 24px;
  display: flex;
  gap: 32px;
  font-size: 14px;
  border: 1px solid var(--border-light);
}

.stat-item {
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-item.active {
  color: #2e7d32;
}

.stat-item.inactive {
  color: #c62828;
}

:root.dark .stat-item.active {
  color: #81c784;
}

:root.dark .stat-item.inactive {
  color: #ef9a9a;
}

.resources-table-container {
  background: var(--bg-card);
  border-radius: 28px;
  overflow-x: auto;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.resources-table {
  width: 100%;
  border-collapse: collapse;
}

.resources-table th,
.resources-table td {
  padding: 16px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
}

.resources-table th {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-muted);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.resources-table tr:hover {
  background: var(--bg-secondary);
}

.id-cell {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
}

.resource-name {
  font-weight: 600;
  color: var(--text-primary);
}

.description-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-secondary);
  font-size: 14px;
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

.status-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-inactive {
  background: #ffebee;
  color: #c62828;
}

:root.dark .status-active {
  background: #1b3b1f;
  color: #81c784;
}

:root.dark .status-inactive {
  background: #3b1e1e;
  color: #ef9a9a;
}

.actions {
  display: flex;
  gap: 8px;
  white-space: nowrap;
}

.action-btn {
  padding: 8px;
  border-radius: 40px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.btn-activate {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn-activate:hover {
  background: #c8e6c9;
  transform: none;
}

.btn-deactivate {
  background: #fff3e0;
  color: #ff9800;
}

.btn-deactivate:hover {
  background: #ffe0b2;
  transform: none;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-edit:hover {
  background: #bbdef5;
  transform: none;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background: #ffcdd2;
  transform: none;
}

:root.dark .btn-activate {
  background: #1b3b1f;
  color: #81c784;
}

:root.dark .btn-activate:hover {
  background: #2e5a32;
}

:root.dark .btn-deactivate {
  background: #3d2e1a;
  color: #ffb74d;
}

:root.dark .btn-deactivate:hover {
  background: #5a461f;
}

:root.dark .btn-edit {
  background: #1a3a5a;
  color: #64b5f6;
}

:root.dark .btn-edit:hover {
  background: #2a4a6a;
}

:root.dark .btn-delete {
  background: #3b1e1e;
  color: #ef9a9a;
}

:root.dark .btn-delete:hover {
  background: #5a2e2e;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--bg-card);
  border-radius: 28px;
  color: var(--text-muted);
  border: 1px solid var(--border-light);
}

.btn-create-empty {
  margin-top: 20px;
  display: inline-block;
  background: var(--accent-gold);
  color: white;
  padding: 12px 24px;
  border-radius: 40px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-empty:hover {
  background: var(--accent-gold-hover);
  transform: none;
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
  padding: 0;
  color: var(--text-muted);
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40px;
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

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 40px;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: var(--bg-page);
  color: var(--text-primary);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-gold);
}

.form-group textarea {
  border-radius: 20px;
  resize: vertical;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
}

.checkbox-label span {
  color: var(--text-primary);
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 28px 28px;
  border-top: 1px solid var(--border-light);
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-gold);
  color: white;
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: var(--accent-gold-hover);
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

  .stats-bar {
    flex-direction: column;
    gap: 8px;
    padding: 16px;
  }

  .resources-table th,
  .resources-table td {
    padding: 12px;
  }

  .actions {
    flex-direction: column;
    gap: 6px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }

  .modal-content {
    width: 95%;
  }

  .modal-header h3 {
    font-size: 20px;
  }
}
</style>