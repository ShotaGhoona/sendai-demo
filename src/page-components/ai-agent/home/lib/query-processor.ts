import { ExtractedKeywords, QueryResult } from '../model/types'
import { KeywordExtractor } from './keyword-extractor'
import { SqlGenerator } from './sql-generator'
import { CsvExecutor } from './csv-executor'

export class QueryProcessor {
  private keywordExtractor: KeywordExtractor
  private sqlGenerator: SqlGenerator
  private csvExecutor: CsvExecutor

  constructor() {
    this.keywordExtractor = new KeywordExtractor()
    this.sqlGenerator = new SqlGenerator()
    this.csvExecutor = new CsvExecutor()
  }

  async processQuery(input: string): Promise<QueryResult> {
    try {
      // 1. キーワード抽出
      const keywords = this.keywordExtractor.extract(input)
      
      // 2. キーワードが有効かチェック
      if (!this.keywordExtractor.hasValidKeywords(keywords)) {
        return {
          sql: '',
          preview: [],
          keywords,
          error: 'より具体的にお聞かせください。ブランド名や時期を含めて入力してください。',
          totalRows: 0
        }
      }

      // 3. SQL生成
      const sql = this.sqlGenerator.generate(keywords)
      
      // 4. SQL検証
      if (!this.sqlGenerator.isValidSql(sql)) {
        return {
          sql,
          preview: [],
          keywords,
          error: 'クエリの生成に失敗しました。入力内容を確認してください。',
          totalRows: 0
        }
      }

      // 5. プレビュー実行（5行）
      const preview = await this.csvExecutor.executePreview(sql)
      
      return {
        sql,
        preview,
        keywords,
        totalRows: preview.length
      }
    } catch (error) {
      return {
        sql: '',
        preview: [],
        keywords: {},
        error: `処理中にエラーが発生しました: ${error}`,
        totalRows: 0
      }
    }
  }

  async executeFullQuery(sql: string, keywords: ExtractedKeywords, onProgress?: (progress: number) => void): Promise<QueryResult> {
    try {
      // 全件実行
      const fullResults = await this.csvExecutor.executeFull(sql, onProgress)
      
      return {
        sql,
        preview: [],
        fullResults,
        keywords,
        totalRows: fullResults.length
      }
    } catch (error) {
      return {
        sql,
        preview: [],
        keywords,
        error: `実行中にエラーが発生しました: ${error}`,
        totalRows: 0
      }
    }
  }

  // CSV データの事前読み込み
  async preloadData(): Promise<void> {
    try {
      await this.csvExecutor.loadData()
    } catch (error) {
      console.error('CSV data preload failed:', error)
    }
  }

  // クエリの説明を生成
  generateQueryDescription(keywords: ExtractedKeywords): string {
    return this.keywordExtractor.generateDescription(keywords)
  }

  // SQLの説明を生成
  generateSqlDescription(keywords: ExtractedKeywords): string {
    return this.sqlGenerator.generateSqlDescription(keywords)
  }

  // データ統計情報を取得
  getDataStats(): { totalRows: number; isLoaded: boolean } {
    return {
      totalRows: this.csvExecutor.getDataRowCount(),
      isLoaded: this.csvExecutor.isLoaded()
    }
  }

  // プレビュー用SQLを生成
  generatePreviewSql(keywords: ExtractedKeywords): string {
    return this.sqlGenerator.generatePreviewSql(keywords)
  }

  // 入力例を提供
  getExampleQueries(): string[] {
    return [
      'ワンピースの9月の売り上げを教えて',
      'プリキュアのフィギュアの販売数量を知りたい',
      'セーラームーンの関東地域での売上ランキングを表示して',
      'ルフィの夏の売上を教えて',
      'キュアブラックの年間売上を集計して'
    ]
  }

  // よく使われるキーワードを提供
  getPopularKeywords(): { brands: string[]; categories: string[]; timeframes: string[] } {
    return {
      brands: ['ルフィ', 'キュアブラック', 'セーラームーン', 'ゾロ', 'キュアドリーム'],
      categories: ['フィギュア', 'ぬいぐるみ', 'Tシャツ', 'マグカップ', 'キーホルダー'],
      timeframes: ['9月', '夏', '2024年', '春', '10月']
    }
  }
}