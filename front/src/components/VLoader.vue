<script setup>
import { LoaderPinwheel } from 'lucide-vue-next'
</script>

<template>
  <LoaderPinwheel class="loader" color="#FFB308" :size="27" />
</template>

<style scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loader {
  display: block;
  margin: 0 auto;
  animation: rotate 1s linear infinite;
}
</style>