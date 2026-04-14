<template>
  <div class="choice-question">
    <div
      v-for="opt in question.options"
      :key="opt.value"
      class="choice-option"
      :class="{ selected: modelValue === opt.value }"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '@/types'

defineProps<{
  question: Question
  modelValue?: string | number
}>()
defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()
</script>

<style scoped>
.choice-question {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.choice-option {
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.choice-option:hover {
  border-color: var(--color-primary-light);
}
.choice-option.selected {
  border-color: var(--color-primary);
  background: rgba(217, 125, 84, 0.08);
}
</style>
