import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { readStorage, writeStorage } from '@/utils/localState'

const STORAGE_KEY = 'svti:config'

interface PersistedConfigState {
  isShortVersion: boolean
  allowAllRomancePool: boolean
  userGender: string
  userRomancePreference: string[]
}

export const useConfigStore = defineStore('config', () => {
  const persisted = readStorage<PersistedConfigState>(STORAGE_KEY, {
    isShortVersion: false,
    allowAllRomancePool: false,
    userGender: 'unspecified',
    userRomancePreference: ['any'],
  })

  const isShortVersion = ref(persisted.isShortVersion)
  const allowAllRomancePool = ref(persisted.allowAllRomancePool)
  const userGender = ref(persisted.userGender)
  const userRomancePreference = ref<string[]>(persisted.userRomancePreference)

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

  watch(
    [isShortVersion, allowAllRomancePool, userGender, userRomancePreference],
    () => {
      writeStorage(STORAGE_KEY, {
        isShortVersion: isShortVersion.value,
        allowAllRomancePool: allowAllRomancePool.value,
        userGender: userGender.value,
        userRomancePreference: userRomancePreference.value,
      })
    },
    { deep: true },
  )

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
