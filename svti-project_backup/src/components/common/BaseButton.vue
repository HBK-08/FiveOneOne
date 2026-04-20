<template>
  <button class="base-button" :class="[{ outline }, size]" :disabled="disabled" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  outline?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}>()
defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius);
  background: var(--color-primary);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.base-button:hover:not(:disabled) {
  opacity: 0.92;
}
.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.base-button.outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
.base-button.small {
  padding: 6px 12px;
  font-size: 12px;
}
.base-button.large {
  padding: 14px 28px;
  font-size: 16px;
}
</style>
