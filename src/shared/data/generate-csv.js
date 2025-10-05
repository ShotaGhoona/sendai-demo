const fs = require('fs');
const path = require('path');

// データ定義
const brands = [
  'ワンピース', '鬼滅の刃', 'ドラゴンボール', 'ナルト', '進撃の巨人',
  'ポケモン', 'ドラえもん', 'アンパンマン', 'セーラームーン', 'エヴァンゲリオン',
  'ジョジョの奇妙な冒険', 'ハンターハンター', 'スパイファミリー', '呪術廻戦', 'チェンソーマン'
];

const categories = [
  'フィギュア', 'ぬいぐるみ', 'Tシャツ', 'マグカップ', 'キーホルダー',
  'ポスター', 'バッグ', '文房具', 'アクセサリー', 'タオル',
  'クリアファイル', 'ステッカー', 'カード', '時計', 'スマホケース'
];

const characters = {
  'ワンピース': ['ルフィ', 'ゾロ', 'ナミ', 'サンジ', 'チョッパー', 'ロビン', 'フランキー', 'ブルック', 'ジンベエ'],
  '鬼滅の刃': ['炭治郎', '禰豆子', '善逸', '伊之助', '義勇', 'しのぶ', '煉獄', '天元', '蜜璃'],
  'ドラゴンボール': ['悟空', 'ベジータ', 'ピッコロ', '悟飯', 'トランクス', 'ブルマ', 'クリリン', '18号'],
  'ナルト': ['ナルト', 'サスケ', 'サクラ', 'カカシ', 'ガアラ', 'ヒナタ', 'シカマル', 'ネジ'],
  '進撃の巨人': ['エレン', 'ミカサ', 'アルミン', 'リヴァイ', 'エルヴィン', 'ハンジ', 'サシャ', 'ジャン'],
  'ポケモン': ['ピカチュウ', 'イーブイ', 'リザードン', 'フシギダネ', 'ゼニガメ', 'ミュウ', 'ルカリオ'],
  'ドラえもん': ['ドラえもん', 'のび太', 'しずか', 'ジャイアン', 'スネ夫', 'ドラミ'],
  'アンパンマン': ['アンパンマン', 'バイキンマン', 'ドキンちゃん', 'しょくぱんまん', 'カレーパンマン'],
  'セーラームーン': ['うさぎ', 'レイ', 'あみ', 'まこと', 'みなこ', 'ちびうさ'],
  'エヴァンゲリオン': ['シンジ', 'レイ', 'アスカ', 'ゲンドウ', 'ミサト', 'リツコ'],
  'ジョジョの奇妙な冒険': ['ジョナサン', 'ジョセフ', '承太郎', '仗助', 'ジョルノ', 'ディオ'],
  'ハンターハンター': ['ゴン', 'キルア', 'クラピカ', 'レオリオ', 'ヒソカ'],
  'スパイファミリー': ['ロイド', 'アーニャ', 'ヨル', 'ボンド', 'フランキー'],
  '呪術廻戦': ['虎杖', '伏黒', '釘崎', '五条', '七海', '真希', 'パンダ'],
  'チェンソーマン': ['デンジ', 'ポチタ', 'マキマ', 'パワー', 'アキ']
};

const stores = [
  { id: 1, name: '仙台本店', region: '東北' },
  { id: 2, name: '東京渋谷店', region: '関東' },
  { id: 3, name: '大阪梅田店', region: '関西' },
  { id: 4, name: '名古屋栄店', region: '中部' },
  { id: 5, name: '福岡天神店', region: '九州' },
  { id: 6, name: '札幌すすきの店', region: '北海道' },
  { id: 7, name: '横浜みなとみらい店', region: '関東' },
  { id: 8, name: '神戸三宮店', region: '関西' },
  { id: 9, name: '広島本通店', region: '中国' },
  { id: 10, name: '金沢香林坊店', region: '中部' }
];

const manufacturers = [
  'バンダイ', 'タカラトミー', 'グッドスマイルカンパニー', 'メガハウス', 'フリュー',
  'セガ', 'アニプレックス', 'ブシロード', 'コトブキヤ', 'エンスカイ'
];

const events = [
  { id: 1, name: 'アニメジャパン2024' },
  { id: 2, name: 'コミックマーケット104' },
  { id: 3, name: '東京ゲームショウ2024' },
  { id: 4, name: 'ワンダーフェスティバル' },
  { id: 5, name: '夏祭りセール' },
  { id: 6, name: 'クリスマスフェア' },
  { id: 7, name: '新年セール' },
  { id: 8, name: 'ゴールデンウィーク特集' },
  { id: 9, name: '限定コラボ企画' },
  { id: 10, name: '店舗周年祭' }
];

const sizes = ['S', 'M', 'L', 'XL', 'フリーサイズ', '約10cm', '約15cm', '約20cm', '約30cm'];
const colors = ['レッド', 'ブルー', 'グリーン', 'イエロー', 'ピンク', 'ブラック', 'ホワイト', 'オレンジ', 'パープル'];
const targetAges = ['全年齢', '3歳以上', '6歳以上', '12歳以上', '15歳以上', '大人向け'];

// ランダム関数
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1) / 100) * 100 + min;
}

function getSeason(date) {
  const month = new Date(date).getMonth() + 1;
  if (month >= 3 && month <= 5) return '春';
  if (month >= 6 && month <= 8) return '夏';
  if (month >= 9 && month <= 11) return '秋';
  return '冬';
}

// CSV生成関数
function generateCSV(rowCount = 50000) {
  const headers = [
    'id', 'product_name', 'category', 'brand', 'character',
    'sale_date', 'sale_price', 'cost_price', 'quantity', 'store_id', 'store_name', 'region',
    'manufacturer', 'release_date', 'season', 'target_age', 'size', 'color',
    'event_id', 'event_name', 'is_limited'
  ];

  let csvContent = headers.join(',') + '\n';

  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');

  for (let i = 1; i <= rowCount; i++) {
    const brand = getRandomElement(brands);
    const category = getRandomElement(categories);
    const character = getRandomElement(characters[brand]);
    const store = getRandomElement(stores);
    const manufacturer = getRandomElement(manufacturers);
    const event = Math.random() < 0.3 ? getRandomElement(events) : null;
    
    const saleDate = getRandomDate(startDate, endDate);
    const releaseDate = getRandomDate(new Date('2020-01-01'), new Date(saleDate));
    const season = getSeason(saleDate);
    
    const salePrice = getRandomPrice(500, 15000);
    const costPrice = Math.floor(salePrice * (0.4 + Math.random() * 0.3)); // 原価率40-70%
    const quantity = getRandomNumber(1, 20);
    
    const productName = `${brand} ${character} ${category}`;
    const targetAge = getRandomElement(targetAges);
    const size = category === 'Tシャツ' || category === 'バッグ' ? getRandomElement(sizes.slice(0, 5)) : getRandomElement(sizes);
    const color = getRandomElement(colors);
    const isLimited = event ? (Math.random() < 0.5 ? 'TRUE' : 'FALSE') : 'FALSE';
    
    const row = [
      i,
      `"${productName}"`,
      category,
      brand,
      character,
      saleDate,
      salePrice,
      costPrice,
      quantity,
      store.id,
      `"${store.name}"`,
      store.region,
      manufacturer,
      releaseDate,
      season,
      `"${targetAge}"`,
      size,
      color,
      event ? event.id : '',
      event ? `"${event.name}"` : '',
      isLimited
    ];
    
    csvContent += row.join(',') + '\n';
    
    // 進行状況表示
    if (i % 10000 === 0) {
      console.log(`Generated ${i} rows...`);
    }
  }

  return csvContent;
}

// メイン実行
function main() {
  console.log('CSV生成を開始します...');
  const csvData = generateCSV(50000); // 50,000行生成
  
  const outputPath = path.join(__dirname, 'sales_data.csv');
  fs.writeFileSync(outputPath, csvData, 'utf8');
  
  console.log(`CSVファイルが生成されました: ${outputPath}`);
  console.log(`ファイルサイズ: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
}

if (require.main === module) {
  main();
}

module.exports = { generateCSV };