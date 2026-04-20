import type { Question, TraitVector } from '@/types'

export interface UserVectors {
  trait: TraitVector
  romance: {
    stability: number
    openness: number
    independence: number
    romance: number
    adventure: number
    domesticity: number
    socialPresence: number
    growthSupport: number
  }
}

const EMPTY_TRAIT: TraitVector = {
  social: 50,
  pace: 50,
  emotion: 50,
  value: 50,
  natureTech: 50,
  adventure: 50,
  bonding: 50,
  aesthetic: 50,
}

const EMPTY_ROMANCE = {
  stability: 50,
  openness: 50,
  independence: 50,
  romance: 50,
  adventure: 50,
  domesticity: 50,
  socialPresence: 50,
  growthSupport: 50,
}

export function computeVectors(
  questions: Question[],
  answers: Record<string, string | number>,
): UserVectors {
  const traitAcc: Record<keyof TraitVector, { signal: number; maxSignal: number; exposure: number }> = {
    social: { signal: 0, maxSignal: 0, exposure: 0 },
    pace: { signal: 0, maxSignal: 0, exposure: 0 },
    emotion: { signal: 0, maxSignal: 0, exposure: 0 },
    value: { signal: 0, maxSignal: 0, exposure: 0 },
    natureTech: { signal: 0, maxSignal: 0, exposure: 0 },
    adventure: { signal: 0, maxSignal: 0, exposure: 0 },
    bonding: { signal: 0, maxSignal: 0, exposure: 0 },
    aesthetic: { signal: 0, maxSignal: 0, exposure: 0 },
  }

  const romanceAcc: Record<keyof typeof EMPTY_ROMANCE, { signal: number; maxSignal: number; exposure: number }> = {
    stability: { signal: 0, maxSignal: 0, exposure: 0 },
    openness: { signal: 0, maxSignal: 0, exposure: 0 },
    independence: { signal: 0, maxSignal: 0, exposure: 0 },
    romance: { signal: 0, maxSignal: 0, exposure: 0 },
    adventure: { signal: 0, maxSignal: 0, exposure: 0 },
    domesticity: { signal: 0, maxSignal: 0, exposure: 0 },
    socialPresence: { signal: 0, maxSignal: 0, exposure: 0 },
    growthSupport: { signal: 0, maxSignal: 0, exposure: 0 },
  }

  for (const q of questions) {
    const ans = answers[q.id]
    if (ans === undefined || ans === null) continue

    const baseScore = typeof ans === 'number' ? ans : q.options.findIndex((o) => o.value === ans) + 1
    const normalized = normalizeScore(baseScore, q.reverseScored)
    const weight = q.weight ?? 1

    if (q.targetVectors.trait) {
      for (const delta of q.targetVectors.trait) {
        const dim = delta.dimension as keyof TraitVector
        if (traitAcc[dim]) {
          traitAcc[dim].signal += normalized * delta.delta * weight
          traitAcc[dim].maxSignal += Math.abs(delta.delta) * weight
          traitAcc[dim].exposure += weight
        }
      }
    }

    if (q.targetVectors.romance) {
      for (const delta of q.targetVectors.romance) {
        const dim = delta.dimension as keyof typeof EMPTY_ROMANCE
        if (romanceAcc[dim]) {
          romanceAcc[dim].signal += normalized * delta.delta * weight
          romanceAcc[dim].maxSignal += Math.abs(delta.delta) * weight
          romanceAcc[dim].exposure += weight
        }
      }
    }
  }

  const trait: TraitVector = { ...EMPTY_TRAIT }
  for (const key of Object.keys(traitAcc) as Array<keyof TraitVector>) {
    const acc = traitAcc[key]
    trait[key] = projectScore(acc.signal, acc.maxSignal, acc.exposure)
  }

  const romance = { ...EMPTY_ROMANCE }
  for (const key of Object.keys(romanceAcc) as Array<keyof typeof EMPTY_ROMANCE>) {
    const acc = romanceAcc[key]
    romance[key] = projectScore(acc.signal, acc.maxSignal, acc.exposure)
  }

  return { trait, romance }
}

function projectScore(signal: number, maxSignal: number, exposure: number): number {
  if (maxSignal <= 0) return 50

  const normalizedSignal = clamp(signal / maxSignal, -1, 1)
  // Fewer questions means lower confidence, so we shrink lightly toward the midpoint.
  const confidence = 1 - Math.exp(-exposure / 3)

  return clamp(50 + normalizedSignal * 50 * confidence, 0, 100)
}

function normalizeScore(raw: number, reverse: boolean): number {
  let v = raw
  if (v < 1) v = 1
  if (v > 5) v = 5
  const normalized = (v - 3) / 2
  return reverse ? -normalized : normalized
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}
