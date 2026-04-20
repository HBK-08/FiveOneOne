<template>
  <div class="progress-bar">
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: percent + '%' }" />
    </div>
    <div class="progress-text">{{ current }} / {{ total }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  current: number
  total: number
  percent: number
}>()
</script>

<style scoped>
.progress-bar {
  margin-bottom: 16px;
}
.progress-track {
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--color-primary);
  transition: width 0.3s ease;
}
.progress-text {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-muted);
  text-align: right;
}
</style>
