import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { QuizResult } from '@/types'
import { readStorage, writeStorage } from '@/utils/localState'

const STORAGE_KEY = 'svti:result'

export const useResultStore = defineStore('result', () => {
  const result = ref<QuizResult | null>(readStorage<QuizResult | null>(STORAGE_KEY, null))

  function setResult(r: QuizResult) {
    result.value = r
  }

  function clear() {
    result.value = null
  }

  watch(
    result,
    () => {
      writeStorage(STORAGE_KEY, result.value)
    },
    { deep: true },
  )

  return {
    result,
    setResult,
    clear,
  }
})
