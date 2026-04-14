import type { Character, TopRomance, TraitVector } from '@/types'
import type { LoadedData } from './contentLoader'

const ROMANCE_KEYS = [
  'stability',
  'openness',
  'independence',
  'romance',
  'adventure',
  'domesticity',
  'socialPresence',
  'growthSupport',
] as const

export function matchRomance(
  userLoveNeed: Record<string, number>,
  userTrait: TraitVector,
  userGender: string,
  userPreference: string[],
  allowAllPool: boolean,
  data: LoadedData,
): { top: TopRomance[]; bottom: TopRomance | null } {
  const needWeights = (data.scoringRules.romanceMatch?.needWeights || {}) as Record<string, number>
  const conflictConfig = data.scoringRules.romanceMatch?.conflictPenalty
  const hardFilters = data.scoringRules.romanceMatch?.hardFilters

  const scored = data.characters
    .filter((c) => c.romanceProfile && !isNullRomanceProfile(c.romanceProfile))
    .map((c) => {
      if (!passHardFilters(c, userGender, userPreference, allowAllPool, hardFilters)) {
        return { character: c, score: -Infinity }
      }

      let score = 50
      for (const key of ROMANCE_KEYS) {
        const need = userLoveNeed[key] ?? 50
        const profile = (c.romanceProfile as Record<string, number | null>)[key] ?? 50
        const w = needWeights[key] ?? 1
        score -= Math.abs(need - profile) * 0.5 * w
      }

      const complement = data.scoringRules.romanceMatch?.complementBonus
      if (complement?.enabled) {
        for (const rule of complement.dimensions || []) {
          const ut = userTrait[rule.userTrait as keyof TraitVector] ?? 50
          const ct = c.traitVector[rule.characterTrait as keyof TraitVector] ?? 50
          if (Math.abs(ut - ct) > 20) {
            score += rule.bonus
          }
        }
      }

      const penalties = computeConflictPenalties(userLoveNeed, c, conflictConfig)
      score -= penalties.total

      return {
        character: c,
        score: Math.round(score * 10) / 10,
      }
    })
    .filter((item) => item.score > -Infinity)

  scored.sort((a, b) => b.score - a.score)

  const top = scored.slice(0, 3).map((item) => ({
    characterId: item.character.id,
    nameZh: item.character.nameZh,
    nameEn: item.character.nameEn,
    avatar: item.character.avatar,
    score: item.score,
    reasons: ['需求匹配度较高'],
    conflictWarnings: [],
  }))

  const bottomItem = scored.length > 0 ? scored[scored.length - 1] : null
  const bottom: TopRomance | null = bottomItem
    ? {
        characterId: bottomItem.character.id,
        nameZh: bottomItem.character.nameZh,
        nameEn: bottomItem.character.nameEn,
        avatar: bottomItem.character.avatar,
        score: bottomItem.score,
        reasons: [],
        conflictWarnings: ['关系模式差异较大，可能需要更多磨合'],
      }
    : null

  return { top, bottom }
}

function passHardFilters(
  c: Character,
  userGender: string,
  userPreference: string[],
  allowAllPool: boolean,
  hardFilters: unknown,
): boolean {
  if (allowAllPool) return true
  const hf = (hardFilters as { orientationMismatch?: { enabled: boolean; strategy: string } }) || {}
  if (hf.orientationMismatch?.enabled) {
    const preferred = c.partnerPreference?.preferredGender || []
    if (preferred.length > 0 && !preferred.includes(userGender)) {
      return false
    }
  }
  return true
}

function computeConflictPenalties(
  userLoveNeed: Record<string, number>,
  c: Character,
  conflictConfig: unknown,
): { total: number; reasons: string[] } {
  let total = 0
  const reasons: string[] = []
  const rules = c.partnerPreference?.conflictRules || []
  for (const rule of rules) {
    const need = userLoveNeed[rule.field] ?? 50
    let hit = false
    switch (rule.operator) {
      case '>':
        hit = need > rule.value
        break
      case '<':
        hit = need < rule.value
        break
      case '>=':
        hit = need >= rule.value
        break
      case '<=':
        hit = need <= rule.value
        break
      case '==':
        hit = need === rule.value
        break
    }
    if (hit) {
      total += rule.penalty
      reasons.push(rule.reason)
    }
  }
  return { total, reasons }
}

function isNullRomanceProfile(profile: Record<string, number | null>): boolean {
  return ROMANCE_KEYS.every((k) => profile[k] === null)
}
