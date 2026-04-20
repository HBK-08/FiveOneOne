<template>
  <div class="radar-chart">
    <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size">
      <!-- Background grid -->
      <g>
        <circle
          v-for="i in 4"
          :key="i"
          :cx="center"
          :cy="center"
          :r="(radius / 4) * i"
          fill="none"
          stroke="var(--color-border)"
          stroke-width="1"
        />
        <line
          v-for="(point, idx) in axisPoints"
          :key="idx"
          :x1="center"
          :y1="center"
          :x2="point.x"
          :y2="point.y"
          stroke="var(--color-border)"
          stroke-width="1"
        />
      </g>
      <!-- Data polygon -->
      <polygon
        :points="dataPoints.map((p) => `${p.x},${p.y}`).join(' ')"
        fill="rgba(109, 163, 125, 0.25)"
        stroke="var(--color-accent)"
        stroke-width="2"
      />
      <!-- Labels -->
      <text
        v-for="(dim, idx) in dimensions"
        :key="'label-' + idx"
        :x="labelPoints[idx].x"
        :y="labelPoints[idx].y"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="12"
        fill="var(--color-text)"
      >
        {{ dim.nameZh }}
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DimensionScore } from '@/types'

const props = defineProps<{
  dimensions: DimensionScore[]
  size?: number
}>()

const size = computed(() => props.size || 320)
const center = computed(() => size.value / 2)
const radius = computed(() => size.value / 2 - 40)

const count = computed(() => props.dimensions.length)

const axisPoints = computed(() => {
  return Array.from({ length: count.value }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count.value - Math.PI / 2
    return {
      x: center.value + radius.value * Math.cos(angle),
      y: center.value + radius.value * Math.sin(angle),
    }
  })
})

const dataPoints = computed(() => {
  return props.dimensions.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / count.value - Math.PI / 2
    const r = (dim.score / 100) * radius.value
    return {
      x: center.value + r * Math.cos(angle),
      y: center.value + r * Math.sin(angle),
    }
  })
})

const labelPoints = computed(() => {
  return props.dimensions.map((_, i) => {
    const angle = (Math.PI * 2 * i) / count.value - Math.PI / 2
    const r = radius.value + 24
    return {
      x: center.value + r * Math.cos(angle),
      y: center.value + r * Math.sin(angle),
    }
  })
})
</script>

<style scoped>
.radar-chart {
  display: flex;
  justify-content: center;
}
</style>
