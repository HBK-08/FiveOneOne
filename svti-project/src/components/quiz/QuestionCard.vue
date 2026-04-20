<template>
  <div class="question-card-wrap">
    <div class="question-meta">
      <span v-if="question.forRomanceOnly" class="badge romance">伴侣题</span>
      <span v-if="question.reverseScored" class="badge reverse">反向</span>
      <span class="badge dim">{{ primaryDimensionLabel }}</span>
    </div>
    <h3 class="prompt">{{ question.prompt }}</h3>
    <p v-if="question.promptSupplement" class="supplement">{{ question.promptSupplement }}</p>

    <ChoiceQuestion
      v-if="question.type === 'choice'"
      :question="question"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
    <ScaleQuestion
      v-else-if="question.type === 'scale'"
      :question="question"
      :model-value="(modelValue as number | undefined)"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/types'
import dimensionsJson from '@/data/dimensions.json'
import ChoiceQuestion from './ChoiceQuestion.vue'
import ScaleQuestion from './ScaleQuestion.vue'

const props = defineProps<{
  question: Question
  modelValue?: string | number
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const dimensionLabelMap = (dimensionsJson as { dimensions: Array<{ id: string; nameZh: string }> }).dimensions.reduce(
  (map, dimension) => {
    map[dimension.id] = dimension.nameZh
    return map
  },
  {} as Record<string, string>,
)

const primaryDimensionLabel = computed(() => {
  return dimensionLabelMap[props.question.primaryDimension] || props.question.primaryDimension
})
</script>

<style scoped>
.question-card-wrap {
  padding: 4px 0;
}
.question-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-muted);
}
.badge.romance {
  color: #b06ca0;
  border-color: #b06ca0;
}
.badge.reverse {
  color: #9a6a2b;
  border-color: #c49a52;
}
.prompt {
  margin: 0 0 8px;
  font-size: 17px;
  line-height: 1.6;
  color: var(--color-text);
}
.supplement {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--color-muted);
  line-height: 1.5;
}
</style>
