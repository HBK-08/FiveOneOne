<template>
  <div class="romance-card">
    <img v-if="romance.avatar" :src="romance.avatar" class="avatar" />
    <div class="info">
      <div class="name">{{ romance.nameZh }} / {{ romance.nameEn }}</div>
      <div class="score">契合度 {{ romance.score }}%</div>
      <ul v-if="romance.reasons.length" class="list">
        <li v-for="(r, i) in romance.reasons" :key="i">{{ r }}</li>
      </ul>
      <ul v-if="romance.conflictWarnings.length" class="list warn">
        <li v-for="(w, i) in romance.conflictWarnings" :key="i">{{ w }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopRomance } from '@/types'

defineProps<{
  romance: TopRomance
}>()
</script>

<style scoped>
.romance-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--color-bg);
}
.name {
  font-weight: 600;
}
.score {
  font-size: 13px;
  color: var(--color-primary);
  margin-top: 4px;
}
.list {
  margin: 8px 0 0 0;
  padding-left: 16px;
  font-size: 12px;
  color: var(--color-text);
}
.list.warn {
  color: #b85c52;
}
</style>
