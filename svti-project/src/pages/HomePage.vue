<template>
  <div class="home-page">
    <h2>发现你内在的星露谷灵魂</h2>
    <p class="intro">
      SVTI（Stardew Valley Type Indicator）是一款基于本地数据的角色人格测试。
      完成测试后，你将获得最像的星露谷角色、理想伴侣推荐、四字母类型码与八维雷达图。
    </p>

    <BaseCard class="config-card">
      <h3>基础信息（可选）</h3>
      <div class="form-row">
        <label>你的性别</label>
        <select v-model="configStore.userGender">
          <option value="unspecified">不愿透露</option>
          <option value="male">男</option>
          <option value="female">女</option>
          <option value="nonbinary">非二元</option>
        </select>
      </div>
      <div class="form-row">
        <label>关系偏好</label>
        <select v-model="preferenceSelected">
          <option value="any">不限</option>
          <option value="male">偏好男性</option>
          <option value="female">偏好女性</option>
        </select>
      </div>
      <div class="form-row checkbox">
        <input id="allPool" v-model="configStore.allowAllRomancePool" type="checkbox" />
        <label for="allPool">开放全部伴侣池（包含不可结婚角色）</label>
      </div>
      <div class="form-row checkbox">
        <input id="short" v-model="configStore.isShortVersion" type="checkbox" />
        <label for="short">使用短版测试（示例模式）</label>
      </div>
    </BaseCard>

    <div class="actions">
      <BaseButton size="large" @click="startQuiz">开始测试</BaseButton>
      <BaseButton outline @click="$router.push('/admin')">管理页</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useQuizStore } from '@/stores/quizStore'
import { useResultStore } from '@/stores/resultStore'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseCard from '@/components/common/BaseCard.vue'

const router = useRouter()
const configStore = useConfigStore()
const quizStore = useQuizStore()
const resultStore = useResultStore()

const preferenceSelected = computed({
  get: () => configStore.userRomancePreference[0] || 'any',
  set: (v: string) => configStore.setUserRomancePreference([v]),
})

function startQuiz() {
  quizStore.reset()
  resultStore.clear()
  router.push('/quiz')
}
</script>

<style scoped>
.home-page {
  text-align: center;
}
.intro {
  color: var(--color-muted);
  max-width: 640px;
  margin: 12px auto 28px;
  line-height: 1.6;
}
.config-card {
  max-width: 480px;
  margin: 0 auto 24px;
  text-align: left;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}
.form-row label {
  min-width: 80px;
  font-size: 14px;
}
.form-row select {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
}
.form-row.checkbox {
  gap: 8px;
}
.form-row.checkbox label {
  min-width: auto;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
