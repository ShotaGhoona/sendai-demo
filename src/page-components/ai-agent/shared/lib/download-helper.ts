export class DownloadHelper {
  // CSVデータをダウンロード
  static downloadCSV(data: any[], filename: string = 'results.csv'): void {
    try {
      if (!data || data.length === 0) {
        throw new Error('データが空です')
      }

      const csvContent = this.convertToCSV(data)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      this.downloadBlob(blob, filename)
    } catch (error) {
      console.error('CSV download failed:', error)
      throw error
    }
  }

  // JSONデータをダウンロード
  static downloadJSON(data: any, filename: string = 'data.json'): void {
    try {
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      
      this.downloadBlob(blob, filename)
    } catch (error) {
      console.error('JSON download failed:', error)
      throw error
    }
  }

  // SQLファイルをダウンロード
  static downloadSQL(sql: string, filename: string = 'query.sql'): void {
    try {
      const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' })
      
      this.downloadBlob(blob, filename)
    } catch (error) {
      console.error('SQL download failed:', error)
      throw error
    }
  }

  // 配列データをCSV形式に変換
  private static convertToCSV(data: any[]): string {
    if (data.length === 0) return ''

    // ヘッダー行を取得
    const headers = Object.keys(data[0])
    
    // CSVヘッダー
    let csvContent = headers.map(header => this.escapeCsvValue(header)).join(',') + '\n'
    
    // データ行
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        return this.escapeCsvValue(value)
      })
      csvContent += values.join(',') + '\n'
    })

    return csvContent
  }

  // CSV値をエスケープ
  private static escapeCsvValue(value: any): string {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value)
    
    // カンマ、改行、ダブルクォートが含まれている場合はクォートで囲む
    if (stringValue.includes(',') || 
        stringValue.includes('\n') || 
        stringValue.includes('\r') || 
        stringValue.includes('"')) {
      // ダブルクォートをエスケープしてからクォートで囲む
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  // Blobをダウンロード
  private static downloadBlob(blob: Blob, filename: string): void {
    // ダウンロードリンクを作成
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    // ダウンロードを実行
    document.body.appendChild(link)
    link.click()
    
    // クリーンアップ
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // ファイル名に日時を追加
  static addTimestampToFilename(filename: string): string {
    const now = new Date()
    const timestamp = now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .replace('T', '_')
    
    const dotIndex = filename.lastIndexOf('.')
    if (dotIndex === -1) {
      return `${filename}_${timestamp}`
    }
    
    const name = filename.substring(0, dotIndex)
    const extension = filename.substring(dotIndex)
    
    return `${name}_${timestamp}${extension}`
  }

  // ファイルサイズを人間が読みやすい形式に変換
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // データの行数とサイズを取得
  static getDataInfo(data: any[]): { rows: number; estimatedSize: string } {
    const rows = data.length
    const jsonString = JSON.stringify(data)
    const estimatedBytes = new Blob([jsonString]).size
    
    return {
      rows,
      estimatedSize: this.formatFileSize(estimatedBytes)
    }
  }

  // 安全なファイル名を生成（無効な文字を除去）
  static sanitizeFilename(filename: string): string {
    // 無効な文字を除去または置換
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')  // 無効な文字をアンダースコアに置換
      .replace(/\s+/g, '_')          // 空白をアンダースコアに置換
      .replace(/_{2,}/g, '_')        // 連続するアンダースコアを1つに
      .replace(/^_|_$/g, '')         // 先頭・末尾のアンダースコアを除去
      .substring(0, 100)             // 長さ制限
  }

  // プレビュー用に先頭数行のCSVを生成
  static generatePreviewCSV(data: any[], maxRows: number = 10): string {
    if (!data || data.length === 0) return ''
    
    const previewData = data.slice(0, maxRows)
    return this.convertToCSV(previewData)
  }
}