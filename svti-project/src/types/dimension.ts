export interface DimensionDefinition {
  id: string
  nameZh: string
  nameEn: string
  lowLabel: string
  highLabel: string
  radarOrder: number
  axisMapping: {
    axis: 'SC' | 'FP' | 'RI' | 'NT'
    weight: number
  }
}

export interface AxisDefinition {
  id: 'SC' | 'FP' | 'RI' | 'NT'
  nameZh: string
  nameEn: string
  lowLetter: string
  highLetter: string
  lowLabel: string
  highLabel: string
}
