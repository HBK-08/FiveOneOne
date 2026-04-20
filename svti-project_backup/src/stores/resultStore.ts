import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { QuizResult } from '@/types'

export const useResultStore = defineStore('result', () => {
  const result = ref<QuizResult | null>(null)

  function setResult(r: QuizResult) {
    result.value = r
  }

  function clear() {
    result.value = null
  }

  return {
    result,
    setResult,
    clear,
  }
})
