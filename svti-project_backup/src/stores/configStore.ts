import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const isShortVersion = ref(false)
  const allowAllRomancePool = ref(false)
  const userGender = ref('unspecified')
  const userRomancePreference = ref<string[]>(['any'])

  const quizVersion = computed(() => (isShortVersion.value ? 'short' : 'full'))

  function setShortVersion(v: boolean) {
    isShortVersion.value = v
  }

  function setAllowAllRomancePool(v: boolean) {
    allowAllRomancePool.value = v
  }

  function setUserGender(g: string) {
    userGender.value = g
  }

  function setUserRomancePreference(p: string[]) {
    userRomancePreference.value = p
  }

  return {
    isShortVersion,
    allowAllRomancePool,
    userGender,
    userRomancePreference,
    quizVersion,
    setShortVersion,
    setAllowAllRomancePool,
    setUserGender,
    setUserRomancePreference,
  }
})
