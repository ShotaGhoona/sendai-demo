import { ExtractedKeywords } from '../model/types'

export class SqlGenerator {
  generate(keywords: ExtractedKeywords): string {
    const conditions: string[] = []
    let selectClause = 'SELECT *'
    let groupByClause = ''
    let orderByClause = ''
    let limitClause = ''

    // 日付範囲の条件を追加
    if (keywords.dateRange && keywords.dateRange.type === 'relative') {
      const { startDays, endDays } = keywords.dateRange
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - (startDays || 0))
      const endDate = new Date(today)
      endDate.setDate(today.getDate() - (endDays || 0))

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      conditions.push(`sale_date >= '${startDateStr}' AND sale_date <= '${endDateStr}'`)
    }

    // SELECT句を分析タイプに応じて生成
    switch (keywords.analysisType) {
      case 'trend':
        // 時系列分析の場合
        const trendGroupFields = []
        if (keywords.groupBy && keywords.groupBy.length > 0) {
          for (const group of keywords.groupBy) {
            if (group === 'store') trendGroupFields.push('store_name')
            else if (group === 'date') trendGroupFields.push('DATE(sale_date) as date')
            else if (group === 'brand') trendGroupFields.push('brand')
            else if (group === 'category') trendGroupFields.push('category')
          }
        }
        selectClause = `SELECT ${trendGroupFields.join(', ')}, SUM(sale_price * quantity) as total_sales, SUM(quantity) as total_quantity`
        groupByClause = `GROUP BY ${trendGroupFields.map(f => f.includes(' as ') ? f.split(' as ')[0] : f).join(', ')}`
        orderByClause = trendGroupFields.includes('DATE(sale_date) as date')
          ? 'ORDER BY date ASC'
          : 'ORDER BY total_sales DESC'
        break

      case 'sales':
        // groupByが指定されている場合はそれを優先
        if (keywords.groupBy && keywords.groupBy.length > 0) {
          const salesGroupFields = []
          for (const group of keywords.groupBy) {
            if (group === 'store') salesGroupFields.push('store_name')
            else if (group === 'date') salesGroupFields.push('DATE(sale_date) as date')
            else if (group === 'brand') salesGroupFields.push('brand')
            else if (group === 'category') salesGroupFields.push('category')
          }
          selectClause = `SELECT ${salesGroupFields.join(', ')}, SUM(sale_price * quantity) as total_sales`
          groupByClause = `GROUP BY ${salesGroupFields.map(f => f.includes(' as ') ? f.split(' as ')[0] : f).join(', ')}`
          orderByClause = 'ORDER BY total_sales DESC'
        } else if (keywords.brand || keywords.category || keywords.region || keywords.store) {
          const groupFields = []
          if (keywords.brand) groupFields.push('brand')
          if (keywords.category) groupFields.push('category')
          if (keywords.region) groupFields.push('region')
          if (keywords.store) groupFields.push('store_name')

          selectClause = `SELECT ${groupFields.join(', ')}, SUM(sale_price * quantity) as total_sales`
          groupByClause = `GROUP BY ${groupFields.join(', ')}`
          orderByClause = 'ORDER BY total_sales DESC'
        } else {
          selectClause = 'SELECT SUM(sale_price * quantity) as total_sales'
        }
        break
        
      case 'ranking':
        // groupByが店舗ごとの場合
        if (keywords.groupBy && keywords.groupBy.includes('store')) {
          selectClause = 'SELECT store_name, SUM(sale_price * quantity) as total_sales'
          groupByClause = 'GROUP BY store_name'
          orderByClause = 'ORDER BY total_sales DESC'
          limitClause = 'LIMIT 10'
        } else {
          selectClause = 'SELECT product_name, brand, SUM(sale_price * quantity) as total_sales'
          groupByClause = 'GROUP BY product_name, brand'
          orderByClause = 'ORDER BY total_sales DESC'
          limitClause = 'LIMIT 10'
        }
        break
        
      case 'count':
        if (keywords.brand || keywords.category) {
          const groupFields = []
          if (keywords.brand) groupFields.push('brand')
          if (keywords.category) groupFields.push('category')
          
          selectClause = `SELECT ${groupFields.join(', ')}, SUM(quantity) as total_quantity`
          groupByClause = `GROUP BY ${groupFields.join(', ')}`
          orderByClause = 'ORDER BY total_quantity DESC'
        } else {
          selectClause = 'SELECT SUM(quantity) as total_quantity'
        }
        break
        
      case 'average':
        if (keywords.category) {
          selectClause = 'SELECT category, AVG(sale_price) as avg_price'
          groupByClause = 'GROUP BY category'
        } else {
          selectClause = 'SELECT AVG(sale_price) as avg_price'
        }
        break
        
      default:
        selectClause = 'SELECT *'
    }
    
    // WHERE条件を生成
    if (keywords.brand) {
      conditions.push(`brand = '${keywords.brand}'`)
    }
    
    if (keywords.category) {
      conditions.push(`category = '${keywords.category}'`)
    }
    
    if (keywords.timeCondition) {
      conditions.push(keywords.timeCondition)
    }
    
    if (keywords.region) {
      conditions.push(`region = '${keywords.region}'`)
    }
    
    if (keywords.store) {
      conditions.push(`store_name = '${keywords.store}'`)
    }
    
    if (keywords.manufacturer) {
      conditions.push(`manufacturer = '${keywords.manufacturer}'`)
    }
    
    if (keywords.isLimited) {
      conditions.push("is_limited = 'TRUE'")
    }
    
    // SQL文を組み立て（改行で整形）
    let sql = `${selectClause}\nFROM sales_data`
    
    if (conditions.length > 0) {
      sql += `\nWHERE ${conditions[0]}`
      for (let i = 1; i < conditions.length; i++) {
        sql += `\n  AND ${conditions[i]}`
      }
    }
    
    if (groupByClause) {
      sql += `\n${groupByClause}`
    }
    
    if (orderByClause) {
      sql += `\n${orderByClause}`
    }
    
    if (limitClause) {
      sql += `\n${limitClause}`
    }
    
    return sql
  }
  
  // プレビュー用SQLを生成（LIMIT 5を追加）
  generatePreviewSql(keywords: ExtractedKeywords): string {
    const baseSql = this.generate(keywords)
    
    // 既にLIMITがある場合はそのまま
    if (baseSql.includes('LIMIT')) {
      return baseSql
    }
    
    return `${baseSql} LIMIT 5`
  }
  
  // SQLが有効かどうかを簡単チェック
  isValidSql(sql: string): boolean {
    const requiredKeywords = ['SELECT', 'FROM']
    const upperSql = sql.toUpperCase()
    
    return requiredKeywords.every(keyword => upperSql.includes(keyword))
  }
  
  // SQLの説明を生成
  generateSqlDescription(keywords: ExtractedKeywords): string {
    const parts: string[] = []
    
    switch (keywords.analysisType) {
      case 'sales':
        parts.push('売上金額を集計')
        break
      case 'ranking':
        parts.push('売上ランキングを表示')
        break
      case 'count':
        parts.push('販売数量を集計')
        break
      case 'average':
        parts.push('平均価格を算出')
        break
      case 'trend':
        parts.push('売上推移を分析')
        break
    }
    
    const conditions: string[] = []
    if (keywords.brand) conditions.push(`ブランド: ${keywords.brand}`)
    if (keywords.category) conditions.push(`カテゴリ: ${keywords.category}`)
    if (keywords.timeDisplay) conditions.push(`期間: ${keywords.timeDisplay}`)
    if (keywords.region) conditions.push(`地域: ${keywords.region}`)
    if (keywords.store) conditions.push(`店舗: ${keywords.store}`)
    if (keywords.manufacturer) conditions.push(`メーカー: ${keywords.manufacturer}`)
    if (keywords.isLimited) conditions.push('限定商品のみ')
    
    if (conditions.length > 0) {
      parts.push(`条件: ${conditions.join(', ')}`)
    }
    
    return parts.join(' | ')
  }
}