<template>
  <div class="admin-page">
    <h2>本地管理页</h2>
    <p class="hint">此页面仅用于本地调试与数据校验，不做登录控制。</p>

    <BaseCard class="stat-card">
      <h3>数据概览</h3>
      <ul>
        <li>维度数量：{{ dimensions.length }}</li>
        <li>完整版题目数：{{ questionsFull.length }}</li>
        <li>短版题目数：{{ questionsShort.length }}</li>
        <li>角色数量：{{ characters.length }}</li>
      </ul>
    </BaseCard>

    <BaseCard class="stat-card">
      <h3>校验结果</h3>
      <div v-if="validation.ok" class="ok">所有校验通过</div>
      <div v-else>
        <div v-for="(err, i) in validation.errors" :key="i" class="error">{{ err }}</div>
      </div>
    </BaseCard>

    <BaseCard class="stat-card">
      <h3>维度列表</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>中文名</th>
            <th>轴映射</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in dimensions" :key="d.id">
            <td>{{ d.id }}</td>
            <td>{{ d.nameZh }}</td>
            <td>{{ d.axisMapping.axis }} ({{ d.axisMapping.weight }})</td>
          </tr>
        </tbody>
      </table>
    </BaseCard>

    <div class="actions">
      <BaseButton @click="$router.push('/')">返回首页</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { loadAllData, validateCharacter, validateQuestion } from '@/utils'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const dimensions = ref<any[]>([])
const questionsFull = ref<any[]>([])
const questionsShort = ref<any[]>([])
const characters = ref<any[]>([])
const validation = ref({ ok: true, errors: [] as string[] })

onMounted(async () => {
  const data = await loadAllData()
  dimensions.value = data.dimensions
  questionsFull.value = data.questionsFull
  questionsShort.value = data.questionsShort
  characters.value = data.characters

  const errors: string[] = []
  const dimIds = dimensions.value.map((d) => d.id)

  for (const c of characters.value) {
    const errs = validateCharacter(c)
    if (errs.length) errors.push(`[${c.id || '?'}] ${errs.join('; ')}`)
  }

  for (const q of [...questionsFull.value, ...questionsShort.value]) {
    const errs = validateQuestion(q, dimIds)
    if (errs.length) errors.push(`[${q.id || '?'}] ${errs.join('; ')}`)
  }

  validation.value = { ok: errors.length === 0, errors }
})
</script>

<style scoped>
.admin-page {
  max-width: 720px;
  margin: 0 auto;
}
.hint {
  color: var(--color-muted);
  font-size: 13px;
  margin-bottom: 16px;
}
.stat-card {
  margin-bottom: 16px;
}
.stat-card ul {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
}
.ok {
  color: var(--color-accent);
}
.error {
  color: #b85c52;
  font-size: 13px;
  margin-top: 4px;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  text-align: left;
  padding: 8px 6px;
  border-bottom: 1px solid var(--color-border);
}
th {
  color: var(--color-muted);
}
.actions {
  margin-top: 12px;
}
</style>
