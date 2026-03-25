<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(['close'])
const visible = ref(true)

let timeout = null

const close = () => {
  visible.value = false
  emit('close')
}

onMounted(() => {
  timeout = setTimeout(close, props.duration)
})

onUnmounted(() => {
  if (timeout) clearTimeout(timeout)
})
</script>

<template>
  <transition name="toast">
    <div v-if="visible" :class="['toast', `toast-${type}`]" @click="close">
      <span class="toast-message">{{ message }}</span>
      <button class="toast-close">&times;</button>
    </div>
  </transition>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  z-index: 10000;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background: #4caf50;
  color: white;
}

.toast-error {
  background: #f44336;
  color: white;
}

.toast-info {
  background: #2196f3;
  color: white;
}

.toast-warning {
  background: #ff9800;
  color: white;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  opacity: 0.7;
}

.toast-close:hover {
  opacity: 1;
  transform: none;
  background: none;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>