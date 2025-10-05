export interface ExtractedKeywords {
  brand?: string
  timeCondition?: string
  timeDisplay?: string
  category?: string
  analysisType?: 'sales' | 'ranking' | 'count' | 'average'
  store?: string
  region?: string
  manufacturer?: string
  isLimited?: boolean
}

export interface QueryResult {
  sql: string
  preview: any[]
  fullResults?: any[]
  keywords: ExtractedKeywords
  error?: string
  totalRows?: number
}

export interface KeywordPattern {
  keyword: string
  condition: string
  display: string
}

export interface BrandPattern {
  name: string
  aliases?: string[]
}

export interface CategoryPattern {
  name: string
  aliases?: string[]
}