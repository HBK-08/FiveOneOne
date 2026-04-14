<template>
  <div class="character-card">
    <img v-if="character.avatar" :src="character.avatar" class="avatar" />
    <div class="info">
      <div class="name">{{ character.nameZh }} · {{ character.nameEn }}</div>
      <div class="score">匹配度 {{ character.score }}%</div>
      <div class="tags">
        <span v-for="dim in character.closestDimensions" :key="dim" class="tag close">{{ dim }}</span>
        <span v-for="dim in character.farthestDimensions" :key="dim" class="tag far">{{ dim }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopCharacter } from '@/types'

defineProps<{
  character: TopCharacter
}>()
</script>

<style scoped>
.character-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.avatar {
  width: 64px;
  height: 64px;
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
.tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-bg);
}
.tag.close {
  color: var(--color-accent);
}
.tag.far {
  color: var(--color-muted);
}
</style>
