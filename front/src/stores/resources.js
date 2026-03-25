import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getResources, getResource } from '@/api/resources'

export const useResourcesStore = defineStore('resources', () => {
  const resources = ref([])
  const currentResource = ref(null)
  const loading = ref(false)
  const filters = ref({
    seats_min: null,
    seats_max: null,
    start_time: null,
    end_time: null
  })

  // Пагинация
  const totalPages = ref(1)
  const currentPage = ref(1)
  const perPage = ref(12)
  const totalItems = ref(0)

  const fetchResources = async (params = {}) => {
    loading.value = true
    try {
      const requestParams = {
        ...params,
        page: currentPage.value,
        page_size: perPage.value
      }
      const response = await getResources(requestParams)
      // Если API возвращает пагинированный ответ
      if (response.results) {
        resources.value = response.results
        totalItems.value = response.count
        totalPages.value = Math.ceil(response.count / perPage.value)
      } else {
        resources.value = response
        totalItems.value = response.length
        totalPages.value = 1
      }
    } catch (err) {
      console.error('Ошибка загрузки ресурсов:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchResource = async (id) => {
    loading.value = true
    try {
      currentResource.value = await getResource(id)
    } catch (err) {
      console.error('Ошибка загрузки ресурса:', err)
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1 // Сбрасываем страницу при изменении фильтров
    fetchResources(filters.value)
  }

  const clearFilters = () => {
    filters.value = {
      seats_min: null,
      seats_max: null,
      start_time: null,
      end_time: null
    }
    currentPage.value = 1
    fetchResources()
  }

  const setPage = (page) => {
    currentPage.value = page
    fetchResources(filters.value)
  }

  return {
    resources,
    currentResource,
    loading,
    filters,
    totalPages,
    currentPage,
    totalItems,
    perPage,
    fetchResources,
    fetchResource,
    setFilters,
    clearFilters,
    setPage
  }
})