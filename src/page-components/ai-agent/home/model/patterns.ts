import { BrandPattern, CategoryPattern, KeywordPattern } from './types'

// ブランドパターン
export const BRAND_PATTERNS: BrandPattern[] = [
  // ワンピース
  { name: 'ルフィ', aliases: ['モンキー・D・ルフィ', 'Luffy'] },
  { name: 'ゾロ', aliases: ['ロロノア・ゾロ', 'Zoro'] },
  { name: 'ナミ', aliases: ['Nami'] },
  { name: 'ウソップ', aliases: ['Usopp'] },
  { name: 'サンジ', aliases: ['Sanji'] },
  { name: 'チョッパー', aliases: ['トニートニー・チョッパー', 'Chopper'] },
  { name: 'ロビン', aliases: ['ニコ・ロビン', 'Robin'] },
  { name: 'フランキー', aliases: ['Franky'] },
  { name: 'ブルック', aliases: ['Brook'] },
  { name: 'ジンベエ', aliases: ['Jinbe'] },
  { name: 'エース', aliases: ['ポートガス・D・エース', 'Ace'] },
  { name: 'シャンクス', aliases: ['赤髪のシャンクス', 'Shanks'] },
  { name: 'ロー', aliases: ['トラファルガー・ロー', 'Law'] },
  { name: 'ハンコック', aliases: ['ボア・ハンコック', 'Hancock'] },
  { name: 'バギー', aliases: ['道化のバギー', 'Buggy'] },
  // プリキュア
  { name: 'キュアブラック', aliases: ['Cure Black'] },
  { name: 'キュアホワイト', aliases: ['Cure White'] },
  { name: 'キュアブルーム', aliases: ['Cure Bloom'] },
  { name: 'キュアイーグレット', aliases: ['Cure Egret'] },
  { name: 'キュアドリーム', aliases: ['Cure Dream'] },
  { name: 'キュアルージュ', aliases: ['Cure Rouge'] },
  { name: 'キュアレモネード', aliases: ['Cure Lemonade'] },
  { name: 'キュアミント', aliases: ['Cure Mint'] },
  { name: 'キュアアクア', aliases: ['Cure Aqua'] },
  { name: 'キュアピーチ', aliases: ['Cure Peach'] },
  { name: 'キュアベリー', aliases: ['Cure Berry'] },
  { name: 'キュアパイン', aliases: ['Cure Pine'] },
  { name: 'キュアパッション', aliases: ['Cure Passion'] },
  { name: 'キュアブロッサム', aliases: ['Cure Blossom'] },
  { name: 'キュアマリン', aliases: ['Cure Marine'] },
  // セーラームーン
  { name: 'セーラームーン', aliases: ['うさぎ', 'Sailor Moon'] },
  { name: 'セーラーマーキュリー', aliases: ['亜美', 'Sailor Mercury'] },
  { name: 'セーラーマーズ', aliases: ['レイ', 'Sailor Mars'] },
  { name: 'セーラージュピター', aliases: ['まこと', 'Sailor Jupiter'] },
  { name: 'セーラーヴィーナス', aliases: ['美奈子', 'Sailor Venus'] },
  { name: 'セーラーウラヌス', aliases: ['はるか', 'Sailor Uranus'] },
  { name: 'セーラーネプチューン', aliases: ['みちる', 'Sailor Neptune'] },
  { name: 'セーラープルート', aliases: ['せつな', 'Sailor Pluto'] },
  { name: 'セーラーサターン', aliases: ['ほたる', 'Sailor Saturn'] },
  { name: 'タキシード仮面', aliases: ['まもる', 'Tuxedo Mask'] }
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
  average: ['平均', '平均価格', 'average', 'avg'],
  trend: ['推移', '傾向', 'トレンド', '変化', 'trend']
}

// 日付範囲パターン
export const DATE_RANGE_PATTERNS = [
  { keyword: '本日から2ヶ月前', startDays: 60, endDays: 0, display: '本日から2ヶ月前まで' },
  { keyword: '2ヶ月前', startDays: 60, endDays: 0, display: '2ヶ月前から' },
  { keyword: '直近1年', startDays: 365, endDays: 0, display: '直近1年' },
  { keyword: '直近3ヶ月', startDays: 90, endDays: 0, display: '直近3ヶ月' },
  { keyword: '直近6ヶ月', startDays: 180, endDays: 0, display: '直近6ヶ月' },
  { keyword: '今月', startDays: 30, endDays: 0, display: '今月' },
  { keyword: '先月', startDays: 60, endDays: 30, display: '先月' }
]

// グループ化パターン
export const GROUP_BY_PATTERNS = {
  store: ['店舗ごと', '各店舗', '店舗別', 'by store'],
  date: ['日毎', '日ごと', '日別', '毎日', 'daily', 'by date'],
  brand: ['ブランドごと', '各ブランド', 'ブランド別'],
  category: ['カテゴリごと', '各カテゴリ', 'カテゴリ別'],
  title: ['タイトルごと', '各タイトル', 'タイトル別']
}

// 時系列分析パターン
export const TIME_SERIES_PATTERNS = [
  '推移', 'トレンド', '変化', '時系列', '経過'
]