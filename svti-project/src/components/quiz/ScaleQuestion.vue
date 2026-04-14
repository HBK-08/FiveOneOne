<template>
  <div class="scale-question">
    <div class="scale-labels">
      <span>{{ question.scaleLabels.low }}</span>
      <span>{{ question.scaleLabels.mid }}</span>
      <span>{{ question.scaleLabels.high }}</span>
    </div>
    <div class="scale-options">
      <button
        v-for="n in 5"
        :key="n"
        class="scale-btn"
        :class="{ selected: modelValue === n }"
        @click="$emit('update:modelValue', n)"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '@/types'

defineProps<{
  question: Question
  modelValue?: number
}>()
defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()
</script>

<style scoped>
.scale-question {
  margin-top: 8px;
}
.scale-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-muted);
  margin-bottom: 10px;
}
.scale-options {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.scale-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.scale-btn:hover {
  border-color: var(--color-primary-light);
}
.scale-btn.selected {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}
</style>
