import type { Character, Question } from '@/types'

export function isValidTraitVector(vector: unknown): boolean {
  if (!vector || typeof vector !== 'object') return false
  const requiredKeys = ['social', 'pace', 'emotion', 'value', 'natureTech', 'adventure', 'bonding', 'aesthetic']
  const v = vector as Record<string, unknown>
  return requiredKeys.every((k) => k in v)
}

export function isValidRomanceProfile(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object') return false
  const requiredKeys = ['stability', 'openness', 'independence', 'romance', 'adventure', 'domesticity', 'socialPresence', 'growthSupport']
  const p = profile as Record<string, unknown>
  return requiredKeys.every((k) => k in p)
}

export function validateCharacter(character: Character): string[] {
  const errors: string[] = []
  if (!character.id) errors.push('缺少 id')
  if (!character.nameZh) errors.push('缺少 nameZh')
  if (!character.nameEn) errors.push('缺少 nameEn')
  if (!isValidTraitVector(character.traitVector)) errors.push('traitVector 字段不完整')
  if (!isValidRomanceProfile(character.romanceProfile)) errors.push('romanceProfile 字段不完整')
  return errors
}

export function validateQuestion(question: Question, dimensionIds: string[]): string[] {
  const errors: string[] = []
  if (!question.id) errors.push('缺少 id')
  if (!question.prompt) errors.push('缺少 prompt')
  if (!['choice', 'scale'].includes(question.type)) errors.push('type 不合法')
  if (!dimensionIds.includes(question.primaryDimension)) errors.push(`primaryDimension ${question.primaryDimension} 不存在`)
  if (question.secondaryDimension && !dimensionIds.includes(question.secondaryDimension)) {
    errors.push(`secondaryDimension ${question.secondaryDimension} 不存在`)
  }
  return errors
}
