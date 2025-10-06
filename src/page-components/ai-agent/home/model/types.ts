export interface ExtractedKeywords {
  brand?: string
  timeCondition?: string
  timeDisplay?: string
  category?: string
  analysisType?: 'sales' | 'ranking' | 'count' | 'average' | 'trend'
  store?: string
  region?: string
  manufacturer?: string
  isLimited?: boolean
  dateRange?: {
    type: 'relative' | 'absolute'
    value: string // '2ヶ月前', '直近1年', 'YYYY-MM-DD'など
    startDays?: number // 相対日付の場合の開始日（今日から何日前）
    endDays?: number // 相対日付の場合の終了日
  }
  groupBy?: ('store' | 'date' | 'brand' | 'category')[]
  timeSeries?: boolean // 時系列分析かどうか
}

export interface QueryResult {
  sql: string
  preview: Record<string, unknown>[]
  fullResults?: Record<string, unknown>[]
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