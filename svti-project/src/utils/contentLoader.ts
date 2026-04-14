import type { Character, DimensionDefinition, AxisDefinition, Question } from '@/types'
import dimensionsJson from '@/data/dimensions.json'
import questionsFullJson from '@/data/questions.full.json'
import questionsShortJson from '@/data/questions.short.json'
import scoringRulesJson from '@/data/scoring.rules.json'
import typeMapJson from '@/data/type-map.json'
import displayCopyJson from '@/data/display.copy.json'

export interface LoadedData {
  dimensions: DimensionDefinition[]
  axes: AxisDefinition[]
  questionsFull: Question[]
  questionsShort: Question[]
  scoringRules: typeof scoringRulesJson
  typeMap: typeof typeMapJson
  displayCopy: typeof displayCopyJson
  characters: Character[]
}

export async function loadAllData(): Promise<LoadedData> {
  const dimensionData = dimensionsJson as { dimensions: DimensionDefinition[]; axes: AxisDefinition[] }
  const characterModules = import.meta.glob('@/data/characters/*.json', { eager: true })
  const characters: Character[] = Object.values(characterModules).map((mod) => (mod as { default: Character }).default)

  return {
    dimensions: dimensionData.dimensions,
    axes: dimensionData.axes,
    questionsFull: questionsFullJson as Question[],
    questionsShort: questionsShortJson as Question[],
    scoringRules: scoringRulesJson,
    typeMap: typeMapJson,
    displayCopy: displayCopyJson,
    characters,
  }
}
