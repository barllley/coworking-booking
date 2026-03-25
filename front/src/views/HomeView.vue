<script setup>
import { onMounted, ref } from 'vue'
import { useResourcesStore } from '@/stores/resources'
import { useRouter } from 'vue-router'
import VLoader from '@/components/VLoader.vue'
import Pagination from '@/components/Pagination.vue'
import NavBar from '@/components/NavBar.vue'
import { Users } from 'lucide-vue-next'

const resourcesStore = useResourcesStore()
const router = useRouter()

// Фильтры
const seatsMin = ref(null)
const seatsMax = ref(null)
const startTime = ref('')
const endTime = ref('')

// Применение фильтров
const applyFilters = () => {
  const params = {}
  if (seatsMin.value) params.seats_min = seatsMin.value
  if (seatsMax.value) params.seats_max = seatsMax.value
  if (startTime.value && endTime.value) {
    params.start_time = startTime.value
    params.end_time = endTime.value
  }
  resourcesStore.setFilters(params)
}

// Сброс фильтров
const clearFilters = () => {
  seatsMin.value = null
  seatsMax.value = null
  startTime.value = ''
  endTime.value = ''
  resourcesStore.clearFilters()
}

// Переход на детальную страницу
const goToResource = (id) => {
  router.push(`/resources/${id}`)
}

onMounted(() => {
  resourcesStore.fetchResources()
})
</script>

<template>
  <div class="dashboard">
    <NavBar />

    <div class="page-container">
      <h1>Доступные ресурсы</h1>

      <!-- Блок фильтров -->
      <div class="filters-card">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Количество мест</label>
            <div class="seats-filters">
              <input
                type="number"
                v-model="seatsMin"
                placeholder="От"
                min="1"
                class="filter-input"
              />
              <input
                type="number"
                v-model="seatsMax"
                placeholder="До"
                min="1"
                class="filter-input"
              />
            </div>
          </div>

          <div class="filter-group">
            <label>Дата и время</label>
            <div class="time-filters">
              <input
                type="datetime-local"
                v-model="startTime"
                class="filter-input"
              />
              <span class="separator">—</span>
              <input
                type="datetime-local"
                v-model="endTime"
                class="filter-input"
              />
            </div>
          </div>

          <div class="filter-actions">
            <button @click="applyFilters" class="apply-btn">Применить</button>
            <button @click="clearFilters" class="clear-btn">Сбросить</button>
          </div>
        </div>
      </div>

      <!-- Загрузка -->
      <VLoader v-if="resourcesStore.loading" />

      <!-- Пустое состояние -->
      <div v-else-if="resourcesStore.resources.length === 0" class="empty-state">
        <p>Нет доступных ресурсов</p>
      </div>

      <!-- Список ресурсов -->
      <div v-else>
        <div class="resources-grid">
          <div
            v-for="resource in resourcesStore.resources"
            :key="resource.id"
            class="resource-card"
            @click="goToResource(resource.id)"
          >
            <div class="resource-card__content">
              <h3>{{ resource.name }}</h3>
              <div class="seats-badge">
                <Users :size="16" class="detail-icon" />
                <span>{{ resource.seats }} {{ resource.seats === 1 ? 'место' : 'места' }}</span>
              </div>
              <p class="description">
                {{ resource.description || 'Нет описания' }}
              </p>
            </div>
            <button class="book-btn">Забронировать</button>
          </div>
        </div>

        <!-- Пагинация -->
        <Pagination
          v-if="resourcesStore.totalPages > 1"
          :current-page="resourcesStore.currentPage"
          :total-pages="resourcesStore.totalPages"
          :total-items="resourcesStore.totalItems"
          @page-change="resourcesStore.setPage"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
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
  padding: 42px 24px;
}

h1 {
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
  color: var(--text-primary);
}

/* Фильтры */
.filters-card {
  background: var(--bg-card);
  border-radius: 28px;
  padding: 28px 32px;
  margin-bottom: 40px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.filters-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 24px;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 14px;
}

.seats-filters {
  display: flex;
  gap: 12px;
}

.filter-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--border-light);
  border-radius: 40px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: var(--bg-page);
  color: var(--text-primary);
  box-sizing: border-box;
}

.filter-input:focus {
  outline: none;
  border-color: var(--accent-gold);
}

.time-filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-filters .filter-input {
  flex: 1;
}

.separator {
  color: var(--text-muted);
  font-weight: 500;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.apply-btn {
  background: var(--accent-gold);
  color: white;
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
}

.apply-btn:hover {
  background: var(--accent-gold-hover);
  transform: none;
}

.clear-btn {
  background: transparent;
  color: var(--text-secondary);
  padding: 10px 24px;
  border-radius: 40px;
  font-weight: 500;
  font-size: 14px;
  border: 1px solid var(--border-light);
}

.clear-btn:hover {
  background: var(--bg-secondary);
  transform: none;
}

/* Сетка ресурсов */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.resource-card {
  background: var(--bg-card);
  border-radius: 28px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--border-light);
}

.resource-card:hover {
  transform: translateY(-4px);
  background: var(--bg-secondary);
  box-shadow: var(--shadow-md);
}

.resource-card__content {
  flex: 1;
  margin-bottom: 20px;
}

.resource-card h3 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--text-primary);
  text-align: left;
}

.seats-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-secondary);
  padding: 6px 14px;
  border-radius: 40px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.detail-icon {
  color: var(--text-muted);
}

.description {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.book-btn {
  width: 100%;
  background: var(--accent-gold);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 40px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.book-btn:hover {
  background: var(--accent-gold-hover);
  transform: none;
}

/* Пустое состояние */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: var(--bg-card);
  border-radius: 28px;
  color: var(--text-muted);
  font-size: 16px;
  border: 1px solid var(--border-light);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .filters-grid {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    flex-direction: row;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 24px 20px;
  }

  h1 {
    font-size: 36px;
    margin-bottom: 32px;
  }

  .filters-card {
    padding: 20px;
  }

  .seats-filters {
    flex-direction: column;
    gap: 8px;
  }

  .time-filters {
    flex-direction: column;
  }

  .separator {
    display: none;
  }

  .filter-actions {
    flex-direction: column;
    width: 100%;
  }

  .apply-btn,
  .clear-btn {
    width: 100%;
    text-align: center;
  }

  .resources-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .resource-card h3 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 20px 16px;
  }

  h1 {
    font-size: 28px;
  }

  .filters-card {
    padding: 16px;
  }

  .resource-card {
    padding: 20px;
  }

  .resource-card h3 {
    font-size: 18px;
  }
}
</style>