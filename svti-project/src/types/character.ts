export interface TraitVector {
  social: number | null
  pace: number | null
  emotion: number | null
  value: number | null
  natureTech: number | null
  adventure: number | null
  bonding: number | null
  aesthetic: number | null
}

export interface RomanceProfile {
  stability: number | null
  openness: number | null
  independence: number | null
  romance: number | null
  adventure: number | null
  domesticity: number | null
  socialPresence: number | null
  growthSupport: number | null
}

export interface PartnerPreference {
  preferredGender: string[]
  orientationMode: 'flexible' | 'fixed' | 'player_preference'
  weights: Record<string, number>
  hardFilters: {
    excludeIfOrientationMismatch: boolean
    [key: string]: unknown
  }
  conflictRules: ConflictRule[]
}

export interface ConflictRule {
  field: string
  operator: '>' | '<' | '>=' | '<=' | '=='
  value: number
  penalty: number
  reason: string
}

export interface CharacterCopy {
  oneLiner: string
  analysis: string
  getAlongAdvice: string
  conflictWarning: string
  farmLifeAdvice: string
}

export interface CharacterMeta {
  marriageable: boolean
  source: string
  version: string
}

export interface Character {
  id: string
  nameZh: string
  nameEn: string
  avatar: string
  introShort: string
  introLong: string
  tags: string[]
  traitVector: TraitVector
  romanceProfile: RomanceProfile
  partnerPreference: PartnerPreference
  copy: CharacterCopy
  meta: CharacterMeta
}
