# 11-全体実装戦略

## 概要

SendAI AIエージェントデモの全体実装戦略。オーバーエンジニアリングを避け、実用的でシンプルな実装を目指す。

## 実装スコープ（MVP）

### ✅ 実装する機能
- キーワードベースSQL生成
- チャットID管理とページ遷移
- プレビュー表示（5行）
- 全件実行（ダミープログレス）
- テーブル結果表示
- CSVダウンロード
- ローカルストレージでの履歴管理

### ❌ 実装しない機能（オーバーエンジニアリング回避）
- 複雑なグラフ・可視化（円グラフ、棒グラフ等）
- リアルタイム進行度更新（Redis等）
- お問い合わせ機能
- 高度なエラーハンドリング（2回修正等）
- サーバーサイド連携
- 複雑な自然言語処理

## 全体アーキテクチャ

```
[ユーザー入力] 
    ↓
[キーワード抽出] → if文でパターンマッチング
    ↓
[SQL生成] → テンプレートベース
    ↓
[CSV実行] → JavaScript配列操作
    ↓
[結果表示] → HTMLテーブル + CSVダウンロード
```

## ディレクトリ構成（最終版）

```
src/
├── page-components/ai-agent/
│   ├── home/
│   │   ├── lib/
│   │   │   ├── query-processor.ts          # メインの処理フロー
│   │   │   ├── keyword-extractor.ts        # キーワード抽出（if文）
│   │   │   ├── sql-generator.ts            # SQL生成（テンプレート）
│   │   │   └── csv-executor.ts             # CSV検索・実行
│   │   ├── model/
│   │   │   ├── types.ts                    # 型定義
│   │   │   └── patterns.ts                 # キーワード・SQLパターン
│   │   └── ui/
│   │       └── aiAgentContainer.tsx        # ホームページUI
│   ├── detail/
│   │   ├── lib/
│   │   │   ├── chat-manager.ts             # チャット管理
│   │   │   └── result-formatter.ts         # 結果整形
│   │   ├── model/
│   │   │   └── chat-types.ts               # チャット型定義
│   │   └── ui/
│   │       ├── aiAgentDetailContainer.tsx  # チャット詳細UI
│   │       ├── previewSection.tsx          # プレビュー表示
│   │       ├── resultSection.tsx           # 結果表示
│   │       └── progressIndicator.tsx       # 進行度表示
│   └── shared/
│       ├── lib/
│       │   ├── csv-parser.ts               # CSV読み込み
│       │   ├── storage-manager.ts          # ローカルストレージ管理
│       │   └── download-helper.ts          # CSVダウンロード
│       └── model/
│           └── common-types.ts             # 共通型定義
└── app/analysis/ai-agent/
    ├── page.tsx                            # ホームページ
    └── [chatId]/page.tsx                   # チャット詳細ページ
```

## 実装フェーズ

### Phase 1: 基本フロー構築
1. **キーワード抽出エンジン**
   - ブランド（ワンピース、鬼滅の刃等）
   - 時期（9月、夏等）
   - 分析タイプ（売上、ランキング等）

2. **SQL生成エンジン**
   - if文による条件組み立て
   - SELECT句、WHERE句、GROUP BY句の動的生成

3. **CSV実行エンジン**
   - CSVデータの読み込み
   - JavaScript配列でのフィルタリング・集計

### Phase 2: UI実装
1. **ホームページ**
   - 入力フォーム
   - 履歴一覧
   - チャットID生成・遷移

2. **チャット詳細ページ**
   - プレビューセクション（5行表示）
   - 実行ボタン
   - 進行度表示（ダミー）
   - 結果テーブル

### Phase 3: 仕上げ
1. **ローカルストレージ管理**
   - チャット履歴の永続化
   - 状態復元

2. **CSVダウンロード機能**
   - 結果データのCSV出力

## 主要コンポーネント仕様

### 1. query-processor.ts
```typescript
export class QueryProcessor {
  async processQuery(input: string): Promise<QueryResult> {
    // 1. キーワード抽出
    const keywords = this.keywordExtractor.extract(input)
    
    // 2. SQL生成
    const sql = this.sqlGenerator.generate(keywords)
    
    // 3. プレビュー実行（5行）
    const preview = await this.csvExecutor.executePreview(sql)
    
    // 4. 結果返却
    return { sql, preview, keywords }
  }
  
  async executeFullQuery(sql: string): Promise<QueryResult> {
    // 全件実行（進行度表示付き）
    return await this.csvExecutor.executeFull(sql)
  }
}
```

### 2. keyword-extractor.ts
```typescript
export class KeywordExtractor {
  extract(input: string): ExtractedKeywords {
    const keywords: ExtractedKeywords = {}
    
    // ブランド検出
    BRAND_PATTERNS.forEach(brand => {
      if (input.includes(brand)) {
        keywords.brand = brand
      }
    })
    
    // 時期検出
    TIME_PATTERNS.forEach(pattern => {
      if (input.includes(pattern.keyword)) {
        keywords.timeCondition = pattern.condition
      }
    })
    
    // 分析タイプ検出
    if (input.includes('売上') || input.includes('売り上げ')) {
      keywords.analysisType = 'sales'
    }
    
    return keywords
  }
}
```

### 3. sql-generator.ts
```typescript
export class SqlGenerator {
  generate(keywords: ExtractedKeywords): string {
    let sql = 'SELECT '
    let conditions: string[] = []
    
    // SELECT句生成
    if (keywords.analysisType === 'sales') {
      sql += 'brand, SUM(sale_price * quantity) as total_sales'
    } else {
      sql += '*'
    }
    
    sql += ' FROM sales_data'
    
    // WHERE句生成
    if (keywords.brand) {
      conditions.push(`brand = '${keywords.brand}'`)
    }
    
    if (keywords.timeCondition) {
      conditions.push(keywords.timeCondition)
    }
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`
    }
    
    // GROUP BY句生成
    if (keywords.analysisType === 'sales') {
      sql += ' GROUP BY brand'
    }
    
    return sql
  }
}
```

### 4. csv-executor.ts
```typescript
export class CsvExecutor {
  private data: any[] = []
  
  async loadData(): Promise<void> {
    // CSVデータの読み込み
    const response = await fetch('/sales_data.csv')
    const csvText = await response.text()
    this.data = parseCsv(csvText)
  }
  
  executePreview(sql: string): any[] {
    // SQL解析とデータフィルタリング（簡易版）
    const filteredData = this.filterData(sql)
    return filteredData.slice(0, 5) // 5行のみ
  }
  
  async executeFull(sql: string, onProgress?: (progress: number) => void): Promise<any[]> {
    // ダミーの進行度表示
    for (let i = 0; i <= 100; i += 10) {
      onProgress?.(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    return this.filterData(sql)
  }
  
  private filterData(sql: string): any[] {
    // SQL解析ロジック（簡易版）
    // WHERE句の条件に基づいてデータフィルタリング
    return this.data.filter(row => {
      // 条件判定ロジック
      return true
    })
  }
}
```

## UI実装方針

### 1. ホームページ（aiAgentContainer.tsx）
- **シンプルな入力フォーム**: プレースホルダーで例を示す
- **履歴一覧**: 最新10件のみ表示
- **即座にページ遷移**: 入力後すぐにチャット詳細へ

### 2. チャット詳細ページ（aiAgentDetailContainer.tsx）
- **メッセージ形式**: ユーザー入力 → AI応答
- **プレビューセクション**: 5行のテーブル + 「全件実行」ボタン
- **進行度表示**: シンプルなプログレスバー
- **結果セクション**: 大きなテーブル + CSVダウンロードボタン

### 3. コンポーネント分割
```tsx
// チャット詳細ページの構成
<AiAgentDetailContainer>
  <MessageList>
    <UserMessage />
    <AiResponse>
      <SqlDisplay />
      <PreviewSection />
      <ExecuteButton />
    </AiResponse>
  </MessageList>
  
  {isExecuting && <ProgressIndicator />}
  {result && <ResultSection />}
  
  <InputSection />
</AiAgentDetailContainer>
```

## データフロー

### 1. ホームページでの入力処理
```
入力: "ワンピースの9月の売り上げを教えて"
    ↓
チャットID生成: uuid()
    ↓
ローカルストレージ保存: 初期メッセージ
    ↓
ページ遷移: /analysis/ai-agent/[chatId]?prompt=...
```

### 2. チャット詳細ページでの処理
```
URL初期化
    ↓
プロンプト取得・キーワード抽出
    ↓
SQL生成・プレビュー実行
    ↓
プレビュー表示（5行）
    ↓
[全件実行]ボタンクリック
    ↓
進行度表示（ダミー）
    ↓
結果表示・CSVダウンロード準備
```

## パフォーマンス考慮

### 1. CSVデータ処理
- **遅延読み込み**: 初回アクセス時のみCSV読み込み
- **メモリ管理**: 大容量データの分割処理
- **キャッシュ**: 処理結果のローカルキャッシュ

### 2. UI応答性
- **非同期処理**: CSV処理中もUI操作可能
- **ダミー進行度**: ユーザーエクスペリエンス向上
- **レスポンシブ**: テーブル表示の横スクロール対応

## エラーハンドリング（シンプル版）

### 1. 基本的なエラー対応
- **キーワード未検出**: "より具体的に入力してください"
- **データなし**: "該当するデータが見つかりません"
- **CSV読み込みエラー**: "データの読み込みに失敗しました"

### 2. エラー表示
- **トースト通知**: 軽微なエラー
- **エラーページ**: 致命的なエラー
- **リトライボタン**: 復旧可能なエラー

## 実装優先度

### 🔥 High Priority
1. キーワード抽出エンジン
2. SQL生成エンジン
3. チャットID管理・ページ遷移
4. 基本UI（ホーム・詳細）

### 🟡 Medium Priority
5. CSV実行エンジン
6. プレビュー・結果表示
7. ローカルストレージ管理

### 🟢 Low Priority
8. 進行度表示
9. CSVダウンロード
10. エラーハンドリング
11. UI細部調整

## 品質保証

### 1. テストシナリオ
- **基本フロー**: ホーム入力 → チャット詳細 → 結果表示
- **キーワードパターン**: 様々な入力での動作確認
- **エッジケース**: 空入力、長文入力、特殊文字

### 2. パフォーマンステスト
- **大容量CSV**: 50,000行データでの動作確認
- **メモリ使用量**: ブラウザでの安定動作
- **応答速度**: 処理時間の測定

## デプロイ・運用

### 1. 静的ファイル配置
- **CSV配置**: public/sales_data.csv
- **ビルド最適化**: Next.js最適化設定
- **CDN対応**: 静的ファイルの高速配信

### 2. モニタリング
- **ユーザー行動**: 入力パターンの分析
- **エラー率**: 失敗ケースの把握
- **パフォーマンス**: 処理速度の監視

## まとめ

この戦略により、オーバーエンジニアリングを避けながら実用的なAIエージェントデモを構築できる。段階的実装により、早期からデモ可能な状態を維持し、必要に応じて機能拡張が可能な設計となっている。