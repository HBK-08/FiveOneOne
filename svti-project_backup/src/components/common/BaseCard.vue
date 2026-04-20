<template>
  <div class="base-card">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  border: 1px solid var(--color-border);
}
</style>
