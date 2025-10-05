import { QueryResult } from '../model/types'

export class CsvExecutor {
  private data: any[] = []
  private isDataLoaded = false

  async loadData(): Promise<void> {
    if (this.isDataLoaded) return

    try {
      const response = await fetch('/sales_data.csv')
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`)
      }
      
      const csvText = await response.text()
      this.data = this.parseCsv(csvText)
      this.isDataLoaded = true
    } catch (error) {
      throw new Error(`CSV読み込みエラー: ${error}`)
    }
  }

  private parseCsv(csvText: string): any[] {
    const lines = csvText.trim().split('\n')
    if (lines.length === 0) return []

    // ヘッダー行を取得
    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
    
    // データ行を解析
    const data = []
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length === headers.length) {
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })
        data.push(row)
      }
    }

    return data
  }

  private parseCSVLine(line: string): string[] {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  async executePreview(sql: string): Promise<any[]> {
    await this.loadData()
    
    const filteredData = this.filterData(sql)
    return filteredData.slice(0, 5)
  }

  async executeFull(sql: string, onProgress?: (progress: number) => void): Promise<any[]> {
    await this.loadData()
    
    // ダミーの進行度表示
    if (onProgress) {
      for (let i = 0; i <= 100; i += 20) {
        onProgress(i)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }
    
    return this.filterData(sql)
  }

  private filterData(sql: string): any[] {
    if (this.data.length === 0) return []

    // SQL解析（簡易版）
    const sqlUpper = sql.toUpperCase()
    let result = [...this.data]

    // WHERE句の解析
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/i)
    if (whereMatch) {
      const whereConditions = whereMatch[1]
      result = this.applyWhereConditions(result, whereConditions)
    }

    // GROUP BY句の解析
    const groupByMatch = sql.match(/GROUP\s+BY\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i)
    if (groupByMatch) {
      const groupByFields = groupByMatch[1].split(',').map(field => field.trim())
      result = this.applyGroupBy(result, groupByFields, sql)
    }

    // ORDER BY句の解析
    const orderByMatch = sql.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i)
    if (orderByMatch) {
      const orderByClause = orderByMatch[1]
      result = this.applyOrderBy(result, orderByClause)
    }

    // LIMIT句の解析
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i)
    if (limitMatch) {
      const limit = parseInt(limitMatch[1])
      result = result.slice(0, limit)
    }

    return result
  }

  private applyWhereConditions(data: any[], conditions: string): any[] {
    return data.filter(row => {
      // AND条件で分割
      const andConditions = conditions.split(/\s+AND\s+/i)
      
      return andConditions.every(condition => {
        // 等価条件の解析 (column = 'value')
        const equalMatch = condition.match(/(\w+)\s*=\s*'([^']+)'/i)
        if (equalMatch) {
          const [, column, value] = equalMatch
          return row[column] === value
        }

        // MONTH関数の解析
        const monthMatch = condition.match(/MONTH\((\w+)\)\s*=\s*(\d+)/i)
        if (monthMatch) {
          const [, column, month] = monthMatch
          const date = new Date(row[column])
          return date.getMonth() + 1 === parseInt(month)
        }

        // YEAR関数の解析
        const yearMatch = condition.match(/YEAR\((\w+)\)\s*=\s*(\d+)/i)
        if (yearMatch) {
          const [, column, year] = yearMatch
          const date = new Date(row[column])
          return date.getFullYear() === parseInt(year)
        }

        // season条件の解析
        const seasonMatch = condition.match(/season\s*=\s*'([^']+)'/i)
        if (seasonMatch) {
          const [, season] = seasonMatch
          return row.season === season
        }

        return true
      })
    })
  }

  private applyGroupBy(data: any[], groupFields: string[], sql: string): any[] {
    // SELECT句から集計関数を解析
    const selectMatch = sql.match(/SELECT\s+(.+?)\s+FROM/i)
    if (!selectMatch) return data

    const selectClause = selectMatch[1]
    const groups: { [key: string]: any[] } = {}

    // データをグループ化
    data.forEach(row => {
      const groupKey = groupFields.map(field => row[field.trim()]).join('|')
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(row)
    })

    // 各グループを集計
    const result = Object.entries(groups).map(([groupKey, groupData]) => {
      const groupValues = groupKey.split('|')
      const resultRow: any = {}

      // グループフィールドを設定
      groupFields.forEach((field, index) => {
        resultRow[field.trim()] = groupValues[index]
      })

      // 集計関数を適用
      if (selectClause.includes('SUM(sale_price * quantity)')) {
        resultRow.total_sales = groupData.reduce((sum, row) => {
          return sum + (parseFloat(row.sale_price) * parseInt(row.quantity))
        }, 0)
      }

      if (selectClause.includes('SUM(quantity)')) {
        resultRow.total_quantity = groupData.reduce((sum, row) => {
          return sum + parseInt(row.quantity)
        }, 0)
      }

      if (selectClause.includes('AVG(sale_price)')) {
        const avgPrice = groupData.reduce((sum, row) => {
          return sum + parseFloat(row.sale_price)
        }, 0) / groupData.length
        resultRow.avg_price = Math.round(avgPrice * 100) / 100
      }

      return resultRow
    })

    return result
  }

  private applyOrderBy(data: any[], orderByClause: string): any[] {
    const [field, direction = 'ASC'] = orderByClause.trim().split(/\s+/)
    const isDesc = direction.toUpperCase() === 'DESC'

    return [...data].sort((a, b) => {
      const aVal = a[field]
      const bVal = b[field]

      // 数値の場合
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return isDesc ? bVal - aVal : aVal - bVal
      }

      // 文字列の場合
      const comparison = String(aVal).localeCompare(String(bVal))
      return isDesc ? -comparison : comparison
    })
  }

  getDataRowCount(): number {
    return this.data.length
  }

  isLoaded(): boolean {
    return this.isDataLoaded
  }
}