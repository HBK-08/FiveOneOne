<template>
  <div class="app-wrapper">
    <header class="app-header">
      <h1 class="logo" @click="goHome">SVTI</h1>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <p>Stardew Valley Type Indicator · 本地纯前端项目</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goHome() {
  router.push('/')
}
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}
.logo {
  margin: 0;
  font-size: 22px;
  color: var(--color-primary);
  cursor: pointer;
  letter-spacing: 2px;
}
.app-main {
  flex: 1;
  padding: 24px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
.app-footer {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: var(--color-muted);
  border-top: 1px solid var(--color-border);
}
</style>
