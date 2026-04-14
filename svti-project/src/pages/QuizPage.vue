<template>
  <div class="quiz-page">
    <ProgressBar :current="quizStore.currentIndex + 1" :total="quizStore.totalQuestions" :percent="quizStore.progressPercent" />

    <BaseCard v-if="quizStore.currentQuestion" class="question-card">
      <div class="question-header">
        <span v-if="quizStore.currentQuestion.forRomanceOnly" class="romance-badge">伴侣题</span>
        <span v-if="quizStore.currentQuestion.reverseScored" class="reverse-badge">反向</span>
      </div>
      <h3 class="prompt">{{ quizStore.currentQuestion.prompt }}</h3>
      <p v-if="quizStore.currentQuestion.promptSupplement" class="supplement">
        {{ quizStore.currentQuestion.promptSupplement }}
      </p>

      <ChoiceQuestion
        v-if="quizStore.currentQuestion.type === 'choice'"
        :question="quizStore.currentQuestion"
        :model-value="currentAnswer"
        @update:model-value="onAnswer"
      />
      <ScaleQuestion
        v-else
        :question="quizStore.currentQuestion"
        :model-value="(currentAnswer as number)"
        @update:model-value="onAnswer"
      />
    </BaseCard>

    <div class="nav-actions">
      <BaseButton outline :disabled="quizStore.currentIndex === 0" @click="quizStore.prev()">上一题</BaseButton>
      <BaseButton v-if="!isLast" :disabled="!quizStore.canGoNext()" @click="quizStore.next()">下一题</BaseButton>
      <BaseButton v-else :disabled="!quizStore.canGoNext()" @click="submit">提交</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'
import { useConfigStore } from '@/stores/configStore'
import { useResultStore } from '@/stores/resultStore'
import { loadAllData, computeVectors, computeSVTIType, matchCharacters, matchRomance, checkConsistency } from '@/utils'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ProgressBar from '@/components/quiz/ProgressBar.vue'
import ChoiceQuestion from '@/components/quiz/ChoiceQuestion.vue'
import ScaleQuestion from '@/components/quiz/ScaleQuestion.vue'

const router = useRouter()
const quizStore = useQuizStore()
const configStore = useConfigStore()
const resultStore = useResultStore()

const currentAnswer = computed(() => {
  const q = quizStore.currentQuestion
  return q ? quizStore.answers[q.id] : undefined
})

const isLast = computed(() => quizStore.currentIndex === quizStore.totalQuestions - 1)

function onAnswer(value: string | number) {
  quizStore.answerCurrent(value)
  if (!isLast.value) {
    setTimeout(() => quizStore.next(), 180)
  }
}

async function submit() {
  const data = await loadAllData()
  const vectors = computeVectors(quizStore.questions, quizStore.answers)
  const svtiType = computeSVTIType(vectors.trait, data)
  const topCharacters = matchCharacters(vectors.trait, data)
  const { top: topRomances, bottom: bottomRomance } = matchRomance(
    vectors.romance,
    vectors.trait,
    configStore.userGender,
    configStore.userRomancePreference,
    configStore.allowAllRomancePool,
    data,
  )
  const consistency = checkConsistency(quizStore.questions, quizStore.answers)

  const dimensionScores = data.dimensions.map((d) => ({
    id: d.id,
    nameZh: d.nameZh,
    score: vectors.trait[d.id as keyof typeof vectors.trait] ?? 50,
  }))

  resultStore.setResult({
    svtiType,
    dimensionScores,
    topCharacters,
    topRomances,
    bottomRomance,
  })

  quizStore.submit()
  router.push('/result')
}

onMounted(async () => {
  if (quizStore.totalQuestions === 0) {
    const data = await loadAllData()
    const qs = configStore.quizVersion === 'short' ? data.questionsShort : data.questionsFull
    quizStore.setQuestions(qs)
  }
})
</script>

<style scoped>
.quiz-page {
  max-width: 720px;
  margin: 0 auto;
}
.question-card {
  margin-bottom: 16px;
}
.question-header {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.romance-badge,
.reverse-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-bg);
  color: var(--color-muted);
}
.prompt {
  margin: 0 0 8px;
  font-size: 18px;
  line-height: 1.5;
}
.supplement {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--color-muted);
}
.nav-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
</style>
