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
  const traitAcc: Record<keyof TraitVector, { sum: number; count: number; weights: number }> = {
    social: { sum: 0, count: 0, weights: 0 },
    pace: { sum: 0, count: 0, weights: 0 },
    emotion: { sum: 0, count: 0, weights: 0 },
    value: { sum: 0, count: 0, weights: 0 },
    natureTech: { sum: 0, count: 0, weights: 0 },
    adventure: { sum: 0, count: 0, weights: 0 },
    bonding: { sum: 0, count: 0, weights: 0 },
    aesthetic: { sum: 0, count: 0, weights: 0 },
  }

  const romanceAcc: Record<keyof typeof EMPTY_ROMANCE, { sum: number; count: number; weights: number }> = {
    stability: { sum: 0, count: 0, weights: 0 },
    openness: { sum: 0, count: 0, weights: 0 },
    independence: { sum: 0, count: 0, weights: 0 },
    romance: { sum: 0, count: 0, weights: 0 },
    adventure: { sum: 0, count: 0, weights: 0 },
    domesticity: { sum: 0, count: 0, weights: 0 },
    socialPresence: { sum: 0, count: 0, weights: 0 },
    growthSupport: { sum: 0, count: 0, weights: 0 },
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
          traitAcc[dim].sum += (50 + normalized * delta.delta) * weight
          traitAcc[dim].count += 1
          traitAcc[dim].weights += weight
        }
      }
    }

    if (q.targetVectors.romance) {
      for (const delta of q.targetVectors.romance) {
        const dim = delta.dimension as keyof typeof EMPTY_ROMANCE
        if (romanceAcc[dim]) {
          romanceAcc[dim].sum += (50 + normalized * delta.delta) * weight
          romanceAcc[dim].count += 1
          romanceAcc[dim].weights += weight
        }
      }
    }
  }

  const trait: TraitVector = { ...EMPTY_TRAIT }
  for (const key of Object.keys(traitAcc) as Array<keyof TraitVector>) {
    const acc = traitAcc[key]
    trait[key] = acc.weights > 0 ? clamp(acc.sum / acc.weights, 0, 100) : EMPTY_TRAIT[key]
  }

  const romance = { ...EMPTY_ROMANCE }
  for (const key of Object.keys(romanceAcc) as Array<keyof typeof EMPTY_ROMANCE>) {
    const acc = romanceAcc[key]
    romance[key] = acc.weights > 0 ? clamp(acc.sum / acc.weights, 0, 100) : EMPTY_ROMANCE[key]
  }

  return { trait, romance }
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
