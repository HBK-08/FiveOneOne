import type { Character, Question } from '@/types'

const TRAIT_DIMENSION_IDS = [
  'social', 'pace', 'emotion', 'value', 'natureTech', 'adventure', 'bonding', 'aesthetic',
]

const ROMANCE_DIMENSION_IDS = [
  'stability', 'openness', 'independence', 'romance',
  'adventure', 'domesticity', 'socialPresence', 'growthSupport',
]

const ALL_VALID_DIMENSION_IDS = [...TRAIT_DIMENSION_IDS, ...ROMANCE_DIMENSION_IDS]

export function isValidTraitVector(vector: unknown): boolean {
  if (!vector || typeof vector !== 'object') return false
  const v = vector as Record<string, unknown>
  return TRAIT_DIMENSION_IDS.every((k) => k in v)
}

export function isValidRomanceProfile(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object') return false
  const p = profile as Record<string, unknown>
  return ROMANCE_DIMENSION_IDS.every((k) => k in p)
}

export function validateCharacter(character: Character): string[] {
  const errors: string[] = []
  if (!character.id) errors.push('缺少 id')
  if (!character.nameZh) errors.push('缺少 nameZh')
  if (!character.nameEn) errors.push('缺少 nameEn')
  if (!character.avatar) errors.push('缺少 avatar')
  if (!character.introShort) errors.push('缺少 introShort')
  if (!isValidTraitVector(character.traitVector)) errors.push('traitVector 字段不完整或缺失')
  if (!isValidRomanceProfile(character.romanceProfile)) errors.push('romanceProfile 字段不完整或缺失')
  if (!character.copy?.oneLiner) errors.push('缺少 copy.oneLiner')
  if (!character.meta) errors.push('缺少 meta')
  return errors
}

export function validateQuestion(question: Question, dimensionIds: string[]): string[] {
  const errors: string[] = []
  if (!question.id) errors.push('缺少 id')
  if (!question.prompt) errors.push('缺少 prompt')
  if (!['choice', 'scale'].includes(question.type)) errors.push(`type 不合法: "${question.type}"`)
  if (question.type === 'choice' && (!question.options || question.options.length < 2)) {
    errors.push('选择题至少需要 2 个选项')
  }
  if (question.type === 'scale' && !question.scaleLabels?.low) {
    errors.push('量表题缺少 scaleLabels.low')
  }
  if (!question.weight || question.weight <= 0) errors.push('weight 必须大于 0')

  // primaryDimension can be a trait or romance dimension
  if (
    question.primaryDimension &&
    !dimensionIds.includes(question.primaryDimension) &&
    !ALL_VALID_DIMENSION_IDS.includes(question.primaryDimension)
  ) {
    errors.push(`primaryDimension "${question.primaryDimension}" 不是已知维度`)
  }

  // secondaryDimension is optional, can be trait or romance dimension
  if (
    question.secondaryDimension &&
    !dimensionIds.includes(question.secondaryDimension) &&
    !ALL_VALID_DIMENSION_IDS.includes(question.secondaryDimension)
  ) {
    errors.push(`secondaryDimension "${question.secondaryDimension}" 不是已知维度`)
  }

  return errors
}
