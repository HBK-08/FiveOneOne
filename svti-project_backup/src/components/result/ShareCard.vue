<template>
  <div class="share-card">
    <div class="type-badge">{{ result.svtiType.code }}</div>
    <div class="type-title">{{ typeTitle }}</div>
    <div class="characters">
      <div>最像 {{ topCharacter?.nameZh || '——' }}</div>
      <div>理想伴侣 {{ topRomance?.nameZh || '——' }}</div>
    </div>
    <div class="cta">来测测你的 SVTI 类型</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QuizResult } from '@/types'

const props = defineProps<{
  result: QuizResult
}>()

const typeMap = import.meta.glob('@/data/type-map.json', { eager: true })
const typeData = (Object.values(typeMap)[0] as { default: { types: Record<string, { title: string }> } }).default

const typeTitle = computed(() => {
  return typeData.types[props.result.svtiType.code]?.title || '未知类型'
})

const topCharacter = computed(() => props.result.topCharacters[0] || null)
const topRomance = computed(() => props.result.topRomances[0] || null)
</script>

<style scoped>
.share-card {
  background: linear-gradient(135deg, #fdfbf7 0%, #f3efe6 100%);
  border: 2px solid var(--color-primary-light);
  border-radius: var(--radius);
  padding: 28px;
  text-align: center;
  color: var(--color-text);
}
.type-badge {
  display: inline-block;
  font-size: 36px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 4px;
}
.type-title {
  font-size: 16px;
  margin-top: 6px;
  color: var(--color-muted);
}
.characters {
  margin-top: 18px;
  font-size: 14px;
  line-height: 1.8;
}
.cta {
  margin-top: 18px;
  font-size: 12px;
  color: var(--color-accent);
}
</style>
