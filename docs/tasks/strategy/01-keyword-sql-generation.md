# 01-キーワードベースSQL生成戦略

## 概要

ユーザーの自然言語入力からキーワードを抽出し、if文の組み合わせによってSQLクエリを動的生成する仕組みを構築する。

## 基本戦略

### 1. キーワード抽出パターン

#### ブランド・作品名
```typescript
const brandPatterns = [
  'ワンピース', '鬼滅の刃', 'ドラゴンボール', 'ナルト', '進撃の巨人',
  'ポケモン', 'ドラえもん', 'アンパンマン', 'セーラームーン', 'エヴァンゲリオン'
]
```

#### 時期・期間
```typescript
const timePatterns = {
  月: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  季節: ['春', '夏', '秋', '冬'],
  年: ['2023', '2024']
}
```

#### カテゴリ
```typescript
const categoryPatterns = [
  'フィギュア', 'ぬいぐるみ', 'Tシャツ', 'マグカップ', 'キーホルダー',
  'ポスター', 'バッグ', '文房具', 'アクセサリー', 'タオル'
]
```

#### 分析種別
```typescript
const analysisPatterns = {
  '売上': 'SUM(sale_price * quantity)',
  '売上高': 'SUM(sale_price * quantity)',
  '数量': 'SUM(quantity)',
  '平均': 'AVG(sale_price)',
  'ランキング': 'ORDER BY SUM(sale_price * quantity) DESC'
}
```

### 2. SQL生成ロジック

```typescript
function generateSQL(userInput: string): SQLQuery {
  const conditions: string[] = []
  const groupBy: string[] = []
  let selectClause = 'SELECT *'
  let orderBy = ''
  let limit = ''
  
  // ブランド条件
  brandPatterns.forEach(brand => {
    if (userInput.includes(brand)) {
      conditions.push(`brand = '${brand}'`)
    }
  })
  
  // 時期条件
  timePatterns.月.forEach((month, index) => {
    if (userInput.includes(month)) {
      conditions.push(`MONTH(sale_date) = ${index + 1}`)
    }
  })
  
  // カテゴリ条件
  categoryPatterns.forEach(category => {
    if (userInput.includes(category)) {
      conditions.push(`category = '${category}'`)
    }
  })
  
  // 分析種別に応じたSELECT句とGROUP BY
  if (userInput.includes('売上') || userInput.includes('売上高')) {
    selectClause = 'SELECT brand, SUM(sale_price * quantity) as total_sales'
    groupBy.push('brand')
  }
  
  if (userInput.includes('ランキング')) {
    orderBy = 'ORDER BY total_sales DESC'
    limit = 'LIMIT 10'
  }
  
  // SQL組み立て
  let sql = `${selectClause} FROM sales_data`
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`
  }
  if (groupBy.length > 0) {
    sql += ` GROUP BY ${groupBy.join(', ')}`
  }
  if (orderBy) {
    sql += ` ${orderBy}`
  }
  if (limit) {
    sql += ` ${limit}`
  }
  
  return {
    sql,
    conditions,
    analysisType: detectAnalysisType(userInput)
  }
}
```

## 処理パターン一覧表

| 入力文章 | 抽出キーワード | 生成SQL | 分析タイプ |
|---------|---------------|---------|----------|
| "ワンピースの9月の売り上げを教えて" | ワンピース, 9月, 売り上げ | `SELECT brand, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE brand = 'ワンピース' AND MONTH(sale_date) = 9 GROUP BY brand` | 売上分析 |
| "鬼滅の刃のフィギュアの売上ランキング" | 鬼滅の刃, フィギュア, 売上, ランキング | `SELECT product_name, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE brand = '鬼滅の刃' AND category = 'フィギュア' GROUP BY product_name ORDER BY total_sales DESC LIMIT 10` | ランキング分析 |
| "夏の商品の売上推移" | 夏, 売上 | `SELECT MONTH(sale_date) as month, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE season = '夏' GROUP BY MONTH(sale_date) ORDER BY month` | 推移分析 |
| "ドラゴンボールとナルトの売上比較" | ドラゴンボール, ナルト, 売上 | `SELECT brand, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE brand IN ('ドラゴンボール', 'ナルト') GROUP BY brand` | 比較分析 |
| "10月の新商品の売上" | 10月, 売上 | `SELECT brand, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE MONTH(sale_date) = 10 GROUP BY brand` | 時期分析 |
| "Tシャツの平均価格" | Tシャツ, 平均 | `SELECT category, AVG(sale_price) as avg_price FROM sales_data WHERE category = 'Tシャツ' GROUP BY category` | 統計分析 |
| "仙台本店の売上" | 仙台本店, 売上 | `SELECT store_name, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE store_name = '仙台本店' GROUP BY store_name` | 店舗分析 |
| "関東地域の売上" | 関東, 売上 | `SELECT region, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE region = '関東' GROUP BY region` | 地域分析 |
| "限定商品の売上" | 限定, 売上 | `SELECT brand, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE is_limited = 'TRUE' GROUP BY brand` | 特別商品分析 |
| "バンダイ製品の売上" | バンダイ, 売上 | `SELECT manufacturer, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE manufacturer = 'バンダイ' GROUP BY manufacturer` | メーカー分析 |

## エラーハンドリング

### 1. キーワード未検出時
```typescript
if (conditions.length === 0 && !detectAnalysisType(userInput)) {
  return {
    error: 'より具体的な商品名や期間を指定してください',
    suggestions: ['ワンピースの売上', '9月の売上', 'フィギュアのランキング']
  }
}
```

### 2. 曖昧な指定時
```typescript
if (userInput.includes('売上') && !hasTimeOrBrandFilter(conditions)) {
  return {
    warning: '全期間・全商品の売上を取得します。特定の期間や商品を指定しますか？',
    sql: generatedSQL
  }
}
```

## 拡張性

### 1. 新しいキーワードパターンの追加
- 設定ファイルやJSONでパターンを管理
- 動的にパターンを追加可能

### 2. 複雑な条件の対応
- OR条件: "ワンピースまたは鬼滅の刃"
- 範囲条件: "8月から10月"
- 否定条件: "フィギュア以外"

### 3. 自然言語の揺らぎ対応
- ひらがな・カタカナ変換
- 類義語辞書
- 部分一致・あいまい検索

## 実装優先度

1. **Phase 1**: 基本的なキーワード抽出（ブランド、月、カテゴリ、売上）
2. **Phase 2**: ランキング、比較、統計分析
3. **Phase 3**: 複雑な条件、エラーハンドリング
4. **Phase 4**: 自然言語の揺らぎ対応、拡張機能

## ディレクトリ構成

```
src/
├── page-components/
│   └── ai-agent/
│       ├── home/
│       │   ├── lib/
│       │   │   ├── query-processor.ts          # メインのクエリ処理ロジック
│       │   │   ├── keyword-extractor.ts        # キーワード抽出
│       │   │   ├── sql-generator.ts            # SQL生成
│       │   │   ├── csv-executor.ts             # CSV実行エンジン
│       │   │   └── response-formatter.ts       # レスポンス整形
│       │   ├── model/
│       │   │   ├── query-types.ts              # 型定義
│       │   │   ├── sql-patterns.ts             # SQLパターン定義
│       │   │   └── keyword-patterns.ts         # キーワードパターン定義
│       │   └── ui/
│       │       └── aiAgentContainer.tsx
│       └── detail/
│           ├── lib/
│           │   └── chat-manager.ts             # チャット履歴管理
│           ├── model/
│           │   └── chat-types.ts               # チャット関連型定義
│           └── ui/
│               └── aiAgentDetailContainer.tsx
├── shared/
│   ├── data/
│   │   ├── sales_data.csv                      # 既存CSVデータ
│   │   └── generate-csv.js                     # 既存生成スクリプト
│   └── lib/
│       ├── csv-parser.ts                       # CSV読み込み・パース
│       ├── sql-engine.ts                       # ブラウザ用SQL実行エンジン
│       └── data-cache.ts                       # データキャッシュ管理
└── config/
    └── query-config.ts                         # クエリ設定（キーワードパターン等）
```

### 主要コンポーネントの責務

#### Core Processing Layer
- **query-processor.ts**: メインエントリーポイント、全体の処理フロー制御
- **keyword-extractor.ts**: ユーザー入力からキーワード抽出（「ワンピース」「9月」等）
- **sql-generator.ts**: if文による動的SQL生成
- **csv-executor.ts**: ブラウザでのCSV検索・実行
- **response-formatter.ts**: クエリ結果の表示用データ整形

#### Configuration Layer
- **keyword-patterns.ts**: 戦略書で定義したキーワードパターン
- **sql-patterns.ts**: SQL生成テンプレート
- **query-types.ts**: TypeScript型定義
- **query-config.ts**: 全体設定管理

#### Infrastructure Layer
- **csv-parser.ts**: CSVファイルの読み込み・パース
- **sql-engine.ts**: ブラウザ用SQL実行エンジン（sql.jsまたは独自実装）
- **data-cache.ts**: パフォーマンス向上のためのデータキャッシュ

#### Application Layer
- **chat-manager.ts**: チャット履歴の永続化・管理
- **chat-types.ts**: チャット関連の型定義

この構成により、関心の分離を明確にし、各フェーズでの段階的実装と将来の機能拡張に対応できる設計となっています。