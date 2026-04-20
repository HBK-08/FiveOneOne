import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Question } from '@/types'

export const useQuizStore = defineStore('quiz', () => {
  const currentIndex = ref(0)
  const answers = ref<Record<string, string | number>>({})
  const questions = ref<Question[]>([])
  const isCompleted = ref(false)

  const totalQuestions = computed(() => questions.value.length)
  const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
  const progressPercent = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round((currentIndex.value / totalQuestions.value) * 100)
  })

  function setQuestions(qs: Question[]) {
    questions.value = qs
    currentIndex.value = 0
    answers.value = {}
    isCompleted.value = false
  }

  function answerCurrent(value: string | number) {
    const q = currentQuestion.value
    if (!q) return
    answers.value[q.id] = value
  }

  function next() {
    if (currentIndex.value < totalQuestions.value - 1) {
      currentIndex.value += 1
    }
  }

  function prev() {
    if (currentIndex.value > 0) {
      currentIndex.value -= 1
    }
  }

  function canGoNext() {
    const q = currentQuestion.value
    if (!q) return false
    return answers.value[q.id] !== undefined
  }

  function submit() {
    isCompleted.value = true
  }

  function reset() {
    currentIndex.value = 0
    answers.value = {}
    questions.value = []
    isCompleted.value = false
  }

  return {
    currentIndex,
    answers,
    questions,
    isCompleted,
    totalQuestions,
    currentQuestion,
    progressPercent,
    setQuestions,
    answerCurrent,
    next,
    prev,
    canGoNext,
    submit,
    reset,
  }
})
