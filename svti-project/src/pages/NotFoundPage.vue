<template>
  <div class="not-found">
    <h2>404</h2>
    <p>页面未找到，像走丢的祝尼魔一样迷茫。</p>
    <BaseButton @click="$router.push('/')">回到首页</BaseButton>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/common/BaseButton.vue'
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 60px 0;
}
.not-found h2 {
  font-size: 64px;
  margin: 0;
  color: var(--color-primary);
}
.not-found p {
  color: var(--color-muted);
  margin: 12px 0 24px;
}
</style>
