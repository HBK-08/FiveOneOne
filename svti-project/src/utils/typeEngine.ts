import type { TraitVector, SVTIType } from '@/types'
import type { LoadedData } from './contentLoader'

export function computeSVTIType(trait: TraitVector, data: LoadedData): SVTIType {
  const axisScores: Record<string, number> = {}
  const typeWeights = data.scoringRules.typeAxisWeights as Record<
    string,
    Record<string, number>
  >

  for (const axis of data.axes) {
    const weights = typeWeights[axis.id] || {}
    let score = 50
    let totalWeight = 0
    for (const dimId of Object.keys(weights)) {
      const weight = weights[dimId]
      const dimValue = trait[dimId as keyof TraitVector]
      if (dimValue !== null && dimValue !== undefined) {
        score += (dimValue - 50) * weight
        totalWeight += weight
      }
    }
    axisScores[axis.id] = clamp(score, 0, 100)
  }

  let code = ''
  for (const axis of data.axes) {
    const score = axisScores[axis.id]
    code += score >= 50 ? axis.highLetter : axis.lowLetter
  }

  return {
    code,
    axisScores,
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}
