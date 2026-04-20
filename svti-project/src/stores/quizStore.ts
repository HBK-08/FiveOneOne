import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Question } from '@/types'
import { readStorage, writeStorage } from '@/utils/localState'

const STORAGE_KEY = 'svti:quiz'

interface PersistedQuizState {
  currentIndex: number
  answers: Record<string, string | number>
  questions: Question[]
  isCompleted: boolean
}

export const useQuizStore = defineStore('quiz', () => {
  const persisted = readStorage<PersistedQuizState>(STORAGE_KEY, {
    currentIndex: 0,
    answers: {},
    questions: [],
    isCompleted: false,
  })

  const currentIndex = ref(persisted.currentIndex)
  const answers = ref<Record<string, string | number>>(persisted.answers)
  const questions = ref<Question[]>(persisted.questions)
  const isCompleted = ref(persisted.isCompleted)

  const totalQuestions = computed(() => questions.value.length)
  const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
  const progressPercent = computed(() => {
    if (totalQuestions.value === 0) return 0
    return Math.round(((currentIndex.value + 1) / totalQuestions.value) * 100)
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

  watch(
    [currentIndex, answers, questions, isCompleted],
    () => {
      writeStorage(STORAGE_KEY, {
        currentIndex: currentIndex.value,
        answers: answers.value,
        questions: questions.value,
        isCompleted: isCompleted.value,
      })
    },
    { deep: true },
  )

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
