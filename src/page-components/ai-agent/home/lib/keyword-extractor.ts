import { ExtractedKeywords } from '../model/types'
import {
  BRAND_PATTERNS,
  CATEGORY_PATTERNS,
  TIME_PATTERNS,
  REGION_PATTERNS,
  STORE_PATTERNS,
  MANUFACTURER_PATTERNS,
  ANALYSIS_PATTERNS
} from '../model/patterns'

export class KeywordExtractor {
  extract(input: string): ExtractedKeywords {
    const keywords: ExtractedKeywords = {}
    const lowerInput = input.toLowerCase()
    
    // ブランド検出
    for (const brandPattern of BRAND_PATTERNS) {
      if (input.includes(brandPattern.name)) {
        keywords.brand = brandPattern.name
        break
      }
      
      // エイリアスもチェック
      if (brandPattern.aliases) {
        for (const alias of brandPattern.aliases) {
          if (lowerInput.includes(alias.toLowerCase()) || input.includes(alias)) {
            keywords.brand = brandPattern.name
            break
          }
        }
        if (keywords.brand) break
      }
    }
    
    // カテゴリ検出
    for (const categoryPattern of CATEGORY_PATTERNS) {
      if (input.includes(categoryPattern.name)) {
        keywords.category = categoryPattern.name
        break
      }
      
      // エイリアスもチェック
      if (categoryPattern.aliases) {
        for (const alias of categoryPattern.aliases) {
          if (lowerInput.includes(alias.toLowerCase()) || input.includes(alias)) {
            keywords.category = categoryPattern.name
            break
          }
        }
        if (keywords.category) break
      }
    }
    
    // 時期検出
    for (const timePattern of TIME_PATTERNS) {
      if (input.includes(timePattern.keyword)) {
        keywords.timeCondition = timePattern.condition
        keywords.timeDisplay = timePattern.display
        break
      }
    }
    
    // 地域検出
    for (const region of REGION_PATTERNS) {
      if (input.includes(region)) {
        keywords.region = region
        break
      }
    }
    
    // 店舗検出
    for (const store of STORE_PATTERNS) {
      if (input.includes(store)) {
        keywords.store = store
        break
      }
    }
    
    // メーカー検出
    for (const manufacturer of MANUFACTURER_PATTERNS) {
      if (input.includes(manufacturer)) {
        keywords.manufacturer = manufacturer
        break
      }
    }
    
    // 限定商品検出
    if (input.includes('限定') || input.includes('レア') || input.includes('特別')) {
      keywords.isLimited = true
    }
    
    // 分析タイプ検出
    for (const [type, patterns] of Object.entries(ANALYSIS_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerInput.includes(pattern.toLowerCase()) || input.includes(pattern)) {
          keywords.analysisType = type as ExtractedKeywords['analysisType']
          break
        }
      }
      if (keywords.analysisType) break
    }
    
    // デフォルトの分析タイプ
    if (!keywords.analysisType) {
      keywords.analysisType = 'sales' // デフォルトは売上分析
    }
    
    return keywords
  }
  
  // キーワードが検出されたかどうかをチェック
  hasValidKeywords(keywords: ExtractedKeywords): boolean {
    return !!(keywords.brand || keywords.category || keywords.timeCondition || 
             keywords.region || keywords.store || keywords.manufacturer)
  }
  
  // キーワードの説明文を生成
  generateDescription(keywords: ExtractedKeywords): string {
    const parts: string[] = []
    
    if (keywords.brand) parts.push(keywords.brand)
    if (keywords.category) parts.push(keywords.category)
    if (keywords.timeDisplay) parts.push(keywords.timeDisplay)
    if (keywords.region) parts.push(keywords.region)
    if (keywords.store) parts.push(keywords.store)
    if (keywords.manufacturer) parts.push(keywords.manufacturer)
    if (keywords.isLimited) parts.push('限定商品')
    
    const analysisTypeText = {
      'sales': '売上分析',
      'ranking': 'ランキング分析',
      'count': '数量分析',
      'average': '平均分析'
    }[keywords.analysisType || 'sales']
    
    if (parts.length === 0) {
      return `全体の${analysisTypeText}`
    }
    
    return `${parts.join('・')}の${analysisTypeText}`
  }
}