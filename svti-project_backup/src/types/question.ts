export interface QuestionOption {
  label: string
  value: string | number
}

export interface ScaleLabels {
  low: string
  mid: string
  high: string
}

export interface TargetVectorDelta {
  dimension: string
  delta: number
}

export interface Question {
  id: string
  version: 'full' | 'short'
  prompt: string
  promptSupplement: string
  type: 'choice' | 'scale'
  options: QuestionOption[]
  scaleLabels: ScaleLabels
  targetVectors: {
    trait?: TargetVectorDelta[]
    romance?: TargetVectorDelta[]
  }
  primaryDimension: string
  secondaryDimension: string
  reverseScored: boolean
  consistencyTag: string | null
  forRomanceOnly: boolean
  weight: number
  explanationKey: string
}
