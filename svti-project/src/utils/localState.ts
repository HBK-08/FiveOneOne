const isBrowser = typeof window !== 'undefined'

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T | null) {
  if (!isBrowser) return

  try {
    if (value === null) {
      window.localStorage.removeItem(key)
      return
    }

    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore browser storage failures so the quiz remains usable.
  }
}
