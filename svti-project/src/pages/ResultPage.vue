<template>
  <div v-if="resultStore.result" class="result-page">
    <BaseCard class="hero-card">
      <div class="type-code">{{ resultStore.result.svtiType.code }}</div>
      <div class="type-name">{{ typeName }}</div>
      <div class="axis-scores">
        <div v-for="axis in axisList" :key="axis.id" class="axis-item">
          <span class="axis-label">{{ axis.lowLetter }} / {{ axis.highLetter }}</span>
          <div class="axis-bar">
            <div class="axis-fill" :style="{ width: resultStore.result.svtiType.axisScores[axis.id] + '%' }" />
          </div>
        </div>
      </div>
    </BaseCard>

    <section>
      <h3>你最像的角色 Top 3</h3>
      <CharacterCard
        v-for="char in resultStore.result.topCharacters"
        :key="char.characterId"
        :character="char"
        class="result-card-item"
      />
    </section>

    <section>
      <h3>理想伴侣 Top 3</h3>
      <RomanceCard
        v-for="rom in resultStore.result.topRomances"
        :key="rom.characterId"
        :romance="rom"
        class="result-card-item"
      />
    </section>

    <section v-if="resultStore.result.bottomRomance">
      <h3>最不适合的对象</h3>
      <RomanceCard :romance="resultStore.result.bottomRomance" class="result-card-item" />
    </section>

    <section>
      <h3>八维雷达图</h3>
      <RadarChart :dimensions="resultStore.result.dimensionScores" :size="320" />
    </section>

    <section>
      <h3>分享卡片</h3>
      <ShareCard :result="resultStore.result" />
    </section>

    <div class="actions">
      <BaseButton @click="$router.push('/')">返回首页</BaseButton>
      <BaseButton outline @click="$router.push('/admin')">管理页</BaseButton>
    </div>
  </div>
  <div v-else class="empty-result">
    <p>还没有测试结果，请先完成测试。</p>
    <BaseButton @click="$router.push('/quiz')">去测试</BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResultStore } from '@/stores/resultStore'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import CharacterCard from '@/components/result/CharacterCard.vue'
import RomanceCard from '@/components/result/RomanceCard.vue'
import RadarChart from '@/components/result/RadarChart.vue'
import ShareCard from '@/components/result/ShareCard.vue'
import dimensionsJson from '@/data/dimensions.json'
import typeMapJson from '@/data/type-map.json'

const resultStore = useResultStore()
const axisList = (dimensionsJson as { axes: { id: string; lowLetter: string; highLetter: string }[] }).axes

const typeName = computed(() => {
  const code = resultStore.result?.svtiType.code || ''
  return (typeMapJson as { types: Record<string, { title: string }> }).types[code]?.title || '未知类型'
})
</script>

<style scoped>
.result-page section {
  margin-top: 24px;
}
.result-page h3 {
  margin-bottom: 10px;
  font-size: 16px;
}
.hero-card {
  text-align: center;
}
.type-code {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 6px;
}
.type-name {
  font-size: 16px;
  color: var(--color-muted);
  margin-top: 4px;
}
.axis-scores {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.axis-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.axis-label {
  width: 60px;
  font-size: 13px;
  text-align: center;
}
.axis-bar {
  flex: 1;
  height: 10px;
  background: var(--color-border);
  border-radius: 5px;
  overflow: hidden;
}
.axis-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.6s ease;
}
.result-card-item {
  margin-top: 10px;
}
.actions {
  margin-top: 28px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
.empty-result {
  text-align: center;
  padding: 40px 0;
}
</style>
