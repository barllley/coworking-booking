<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['page-change'])

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}

const getPageNumbers = () => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= props.totalPages; i++) {
    if (i === 1 || i === props.totalPages || (i >= props.currentPage - delta && i <= props.currentPage + delta)) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })

  return rangeWithDots
}
</script>

<template>
  <div class="pagination">
    <div class="pagination-info" v-if="totalItems !== null">
      Всего {{ totalItems }} записей
    </div>
    <div class="pagination-controls">
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="page-btn nav-btn"
      >
        <ChevronLeft :size="18" />
      </button>

      <button
        v-for="page in getPageNumbers()"
        :key="page"
        @click="goToPage(page)"
        :class="['page-btn', { active: page === currentPage, dots: page === '...' }]"
        :disabled="page === '...'"
      >
        {{ page }}
      </button>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="page-btn nav-btn"
      >
        <ChevronRight :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding: 20px 0 0;
  flex-wrap: wrap;
  gap: 20px;
}

.pagination-info {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled):not(.dots) {
  background: var(--bg-secondary);
  border-color: var(--border-light);
  transform: translateY(-1px);
}

.page-btn.active {
  background: var(--accent-gold);
  color: white;
  border-color: var(--accent-gold);
}

.page-btn.active:hover {
  background: var(--accent-gold-hover);
  transform: none;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.dots {
  cursor: default;
  background: transparent;
  border: none;
  min-width: auto;
  padding: 0 4px;
  color: var(--text-muted);
}

.page-btn.dots:hover {
  background: transparent;
  transform: none;
}

.nav-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
}

.nav-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
    padding: 16px 0 0;
  }

  .pagination-info {
    font-size: 13px;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    padding: 0 10px;
    font-size: 13px;
  }

  .pagination-controls {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .page-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    font-size: 12px;
  }

  .pagination-controls {
    gap: 4px;
  }
}
</style>