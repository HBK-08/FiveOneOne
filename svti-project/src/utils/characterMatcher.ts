import type { TraitVector, TopCharacter, Character } from '@/types'
import type { LoadedData } from './contentLoader'
import { computeSVTIType } from './typeEngine'

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

const DIVERSITY_SIMILARITY_THRESHOLD = 0.88

interface PopulationStats {
  mean: Record<keyof TraitVector, number>
  distinctiveness: Record<string, number>
}

interface ScoredCharacter extends TopCharacter {
  baseScore: number
  traitVector: TraitVector
  typeCode: string
}

export function matchCharacters(
  userTrait: TraitVector,
  data: LoadedData,
): TopCharacter[] {
  const characters = data.characters.filter((c) => c.traitVector && !isNullVector(c.traitVector))
  const weights = (data.scoringRules.characterMatch?.weights || {}) as Record<string, number>
  const population = buildPopulationStats(characters)
  const userType = computeSVTIType(userTrait, data)

  const scored = characters.map((character) => {
    const characterType = computeSVTIType(character.traitVector, data)
    const normalizedDistance = computeWeightedDistance(userTrait, character.traitVector, weights)
    const typeBonus = computeTypeBonus(userType.code, characterType.code)
    const distinctivenessBonus = population.distinctiveness[character.id] * 5
    const baseScore = clamp(82 - normalizedDistance * 0.9 + typeBonus + distinctivenessBonus, 0, 100)
    const { closestDimensions, farthestDimensions } = analyzeDimensions(userTrait, character.traitVector)

    return {
      characterId: character.id,
      nameZh: character.nameZh,
      nameEn: character.nameEn,
      avatar: character.avatar,
      score: Math.round(baseScore * 10) / 10,
      closestDimensions,
      farthestDimensions,
      baseScore,
      traitVector: character.traitVector,
      typeCode: characterType.code,
    }
  })

  return selectDiverseTopCharacters(scored, 3).map(({ baseScore: _baseScore, traitVector: _traitVector, typeCode: _typeCode, ...character }) => character)
}

function computeWeightedDistance(
  userTrait: TraitVector,
  characterTrait: TraitVector,
  weights: Record<string, number>,
): number {
  let totalWeightedDistance = 0
  let totalWeight = 0

  for (const key of TRAIT_KEYS) {
    const userValue = userTrait[key] ?? 50
    const characterValue = characterTrait[key] ?? 50
    const baseWeight = weights[key] ?? 1
    const userSalience = 1 + Math.abs(userValue - 50) / 20
    const finalWeight = baseWeight * userSalience

    totalWeightedDistance += Math.abs(userValue - characterValue) * finalWeight
    totalWeight += finalWeight
  }

  return totalWeight > 0 ? totalWeightedDistance / totalWeight : 100
}

function computeTypeBonus(userTypeCode: string, characterTypeCode: string): number {
  const axisMatches = [...userTypeCode].reduce((count, axisLetter, index) => {
    return count + (axisLetter === characterTypeCode[index] ? 1 : 0)
  }, 0)

  return axisMatches * 1.5 + (axisMatches === userTypeCode.length ? 4 : 0)
}

function buildPopulationStats(characters: Character[]): PopulationStats {
  const mean = Object.fromEntries(
    TRAIT_KEYS.map((key) => [
      key,
      characters.reduce((sum, character) => sum + (character.traitVector[key] ?? 50), 0) / characters.length,
    ]),
  ) as Record<keyof TraitVector, number>

  const rawDistinctiveness = characters.map((character) => ({
    id: character.id,
    value: TRAIT_KEYS.reduce((sum, key) => {
      return sum + Math.abs((character.traitVector[key] ?? 50) - mean[key])
    }, 0),
  }))

  const min = Math.min(...rawDistinctiveness.map((item) => item.value))
  const max = Math.max(...rawDistinctiveness.map((item) => item.value))
  const span = Math.max(1, max - min)

  const distinctiveness = Object.fromEntries(
    rawDistinctiveness.map((item) => [item.id, (item.value - min) / span]),
  ) as Record<string, number>

  return { mean, distinctiveness }
}

function selectDiverseTopCharacters(
  scoredCharacters: ScoredCharacter[],
  limit: number,
): ScoredCharacter[] {
  const remaining = [...scoredCharacters].sort((a, b) => b.baseScore - a.baseScore)
  const selected: ScoredCharacter[] = []

  while (selected.length < limit && remaining.length > 0) {
    const available = remaining.filter((candidate) => {
      return !selected.some((picked) => picked.characterId === candidate.characterId)
    })

    if (available.length === 0) break

    const nonDuplicatePool = available.filter((candidate) => {
      return selected.every((picked) => computeVectorSimilarity(picked.traitVector, candidate.traitVector) < DIVERSITY_SIMILARITY_THRESHOLD)
    })

    const pool = nonDuplicatePool.length > 0 ? nonDuplicatePool : available
    const next = pool
      .map((candidate) => {
        const maxSimilarity = selected.length > 0
          ? Math.max(...selected.map((picked) => computeVectorSimilarity(picked.traitVector, candidate.traitVector)))
          : 0
        const rerankScore = candidate.baseScore - maxSimilarity * 12

        return { candidate, rerankScore }
      })
      .sort((a, b) => b.rerankScore - a.rerankScore)[0]?.candidate

    if (!next) break
    selected.push(next)
  }

  return selected
}

function computeVectorSimilarity(a: TraitVector, b: TraitVector): number {
  const averageDiff = TRAIT_KEYS.reduce((sum, key) => {
    return sum + Math.abs((a[key] ?? 50) - (b[key] ?? 50))
  }, 0) / TRAIT_KEYS.length

  return clamp(1 - averageDiff / 100, 0, 1)
}

function analyzeDimensions(userTrait: TraitVector, characterTrait: TraitVector) {
  const diffs = TRAIT_KEYS.map((key) => ({
    key,
    diff: Math.abs((userTrait[key] ?? 50) - (characterTrait[key] ?? 50)),
  }))

  diffs.sort((a, b) => a.diff - b.diff)

  return {
    closestDimensions: diffs.slice(0, 3).map((item) => item.key),
    farthestDimensions: diffs.slice(-2).map((item) => item.key),
  }
}

function isNullVector(vector: TraitVector): boolean {
  return TRAIT_KEYS.every((key) => vector[key] === null)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
