import { BrandPattern, CategoryPattern, KeywordPattern } from './types'

// ブランドパターン
export const BRAND_PATTERNS: BrandPattern[] = [
  { name: 'ワンピース', aliases: ['ワンピ', 'ONE PIECE'] },
  { name: '鬼滅の刃', aliases: ['きめつ', '鬼滅', 'きめつのやいば'] },
  { name: 'ドラゴンボール', aliases: ['ドラゴンボール', 'DB', 'ドラボ'] },
  { name: 'ナルト', aliases: ['NARUTO', 'なると'] },
  { name: '進撃の巨人', aliases: ['進撃', 'しんげき'] },
  { name: 'ポケモン', aliases: ['ポケットモンスター', 'Pokemon'] },
  { name: 'ドラえもん' },
  { name: 'アンパンマン' },
  { name: 'セーラームーン' },
  { name: 'エヴァンゲリオン', aliases: ['エヴァ', 'EVA'] },
  { name: 'ジョジョの奇妙な冒険', aliases: ['ジョジョ', 'JOJO'] },
  { name: 'ハンターハンター', aliases: ['ハンター', 'HUNTER×HUNTER'] },
  { name: 'スパイファミリー', aliases: ['スパファミ'] },
  { name: '呪術廻戦', aliases: ['呪術', 'じゅじゅつ'] },
  { name: 'チェンソーマン', aliases: ['チェンソー'] }
]

// カテゴリパターン
export const CATEGORY_PATTERNS: CategoryPattern[] = [
  { name: 'フィギュア', aliases: ['フィギア', 'figure'] },
  { name: 'ぬいぐるみ', aliases: ['ぬいぐるみ', 'plush'] },
  { name: 'Tシャツ', aliases: ['tシャツ', 'T-shirt', 'tee'] },
  { name: 'マグカップ', aliases: ['マグ', 'カップ'] },
  { name: 'キーホルダー', aliases: ['キーチェーン'] },
  { name: 'ポスター' },
  { name: 'バッグ', aliases: ['バック', 'bag'] },
  { name: '文房具', aliases: ['文具', 'stationery'] },
  { name: 'アクセサリー', aliases: ['アクセ'] },
  { name: 'タオル' }
]

// 時期パターン
export const TIME_PATTERNS: KeywordPattern[] = [
  { keyword: '1月', condition: "MONTH(sale_date) = 1", display: '1月' },
  { keyword: '2月', condition: "MONTH(sale_date) = 2", display: '2月' },
  { keyword: '3月', condition: "MONTH(sale_date) = 3", display: '3月' },
  { keyword: '4月', condition: "MONTH(sale_date) = 4", display: '4月' },
  { keyword: '5月', condition: "MONTH(sale_date) = 5", display: '5月' },
  { keyword: '6月', condition: "MONTH(sale_date) = 6", display: '6月' },
  { keyword: '7月', condition: "MONTH(sale_date) = 7", display: '7月' },
  { keyword: '8月', condition: "MONTH(sale_date) = 8", display: '8月' },
  { keyword: '9月', condition: "MONTH(sale_date) = 9", display: '9月' },
  { keyword: '10月', condition: "MONTH(sale_date) = 10", display: '10月' },
  { keyword: '11月', condition: "MONTH(sale_date) = 11", display: '11月' },
  { keyword: '12月', condition: "MONTH(sale_date) = 12", display: '12月' },
  { keyword: '春', condition: "season = '春'", display: '春' },
  { keyword: '夏', condition: "season = '夏'", display: '夏' },
  { keyword: '秋', condition: "season = '秋'", display: '秋' },
  { keyword: '冬', condition: "season = '冬'", display: '冬' },
  { keyword: '2023', condition: "YEAR(sale_date) = 2023", display: '2023年' },
  { keyword: '2024', condition: "YEAR(sale_date) = 2024", display: '2024年' }
]

// 地域・店舗パターン
export const REGION_PATTERNS = [
  '東北', '関東', '関西', '中部', '九州', '北海道', '中国'
]

export const STORE_PATTERNS = [
  '仙台本店', '東京渋谷店', '大阪梅田店', '名古屋栄店', '福岡天神店',
  '札幌すすきの店', '横浜みなとみらい店', '神戸三宮店', '広島本通店', '金沢香林坊店'
]

// メーカーパターン
export const MANUFACTURER_PATTERNS = [
  'バンダイ', 'タカラトミー', 'グッドスマイルカンパニー', 'メガハウス', 'フリュー',
  'セガ', 'アニプレックス', 'ブシロード', 'コトブキヤ', 'エンスカイ'
]

// 分析タイプパターン
export const ANALYSIS_PATTERNS = {
  sales: ['売上', '売り上げ', '売上高', '販売額', 'sales'],
  ranking: ['ランキング', '順位', 'トップ', '上位', 'ranking'],
  count: ['数量', '個数', '売れた数', '販売数', 'count'],
  average: ['平均', '平均価格', 'average', 'avg']
}