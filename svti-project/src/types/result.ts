export interface DimensionScore {
  id: string
  nameZh: string
  score: number
}

export interface SVTIType {
  code: string
  axisScores: Record<string, number>
}

export interface TopCharacter {
  characterId: string
  nameZh: string
  nameEn: string
  avatar: string
  score: number
  closestDimensions: string[]
  farthestDimensions: string[]
}

export interface TopRomance {
  characterId: string
  nameZh: string
  nameEn: string
  avatar: string
  score: number
  reasons: string[]
  conflictWarnings: string[]
}

export interface QuizResult {
  svtiType: SVTIType
  dimensionScores: DimensionScore[]
  topCharacters: TopCharacter[]
  topRomances: TopRomance[]
  bottomRomance: TopRomance | null
}
