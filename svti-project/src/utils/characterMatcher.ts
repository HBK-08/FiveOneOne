import type { TraitVector, TopCharacter } from '@/types'
import type { LoadedData } from './contentLoader'

const TRAIT_KEYS: Array<keyof TraitVector> = [
  'social',
  'pace',
  'emotion',
  'value',
  'natureTech',
  'adventure',
  'bonding',
  'aesthetic',
]

export function matchCharacters(
  userTrait: TraitVector,
  data: LoadedData,
): TopCharacter[] {
  const weights = (data.scoringRules.characterMatch?.weights || {}) as Record<string, number>
  const results = data.characters
    .filter((c) => c.traitVector && !isNullVector(c.traitVector))
    .map((c) => {
      const distance = computeManhattanDistance(userTrait, c.traitVector, weights)
      const score = Math.max(0, 100 - distance / 8)
      const { closestDimensions, farthestDimensions } = analyzeDimensions(userTrait, c.traitVector)
      return {
        characterId: c.id,
        nameZh: c.nameZh,
        nameEn: c.nameEn,
        avatar: c.avatar,
        score: Math.round(score * 10) / 10,
        closestDimensions,
        farthestDimensions,
      }
    })

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, 3)
}

function computeManhattanDistance(
  u: TraitVector,
  c: TraitVector,
  weights: Record<string, number>,
): number {
  let dist = 0
  for (const key of TRAIT_KEYS) {
    const uv = u[key] ?? 50
    const cv = c[key] ?? 50
    const w = weights[key] ?? 1
    dist += Math.abs(uv - cv) * w
  }
  return dist
}

function analyzeDimensions(u: TraitVector, c: TraitVector) {
  const diffs = TRAIT_KEYS.map((k) => ({
    key: k,
    diff: Math.abs((u[k] ?? 50) - (c[k] ?? 50)),
  }))
  diffs.sort((a, b) => a.diff - b.diff)
  const closestDimensions = diffs.slice(0, 3).map((d) => d.key)
  const farthestDimensions = diffs.slice(-2).map((d) => d.key)
  return { closestDimensions, farthestDimensions }
}

function isNullVector(v: TraitVector): boolean {
  return TRAIT_KEYS.every((k) => v[k] === null)
}
