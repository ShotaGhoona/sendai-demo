# 02-チャットID管理・ページ遷移戦略

## 概要

ユーザーがホームページでプロンプトを入力すると、自動的にチャットIDが生成されて詳細ページに遷移し、入力されたプロンプトで処理を開始するフローを実装する。

## チャットID生成戦略

### 1. ID生成方式

#### 方式A: UUID v4（推奨）
```typescript
// crypto.randomUUID()を使用
const chatId = crypto.randomUUID(); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

**メリット**:
- 衝突リスクが極めて低い
- ブラウザ標準API
- セキュアで推測困難

#### 方式B: タイムスタンプ + ランダム
```typescript
const chatId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// "1696512000000-k2j3h4g5f"
```

**メリット**:
- 時系列順序が保持される
- 読みやすい
- デバッグしやすい

### 2. フロー実装

```typescript
// ホームページ（aiAgentContainer.tsx）
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!inputValue.trim()) return
  
  // 1. チャットID生成
  const chatId = crypto.randomUUID()
  
  // 2. チャット初期データ作成
  const initialChat = {
    id: chatId,
    title: generateTitle(inputValue), // 入力から適切なタイトル生成
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: crypto.randomUUID(),
        type: 'user' as const,
        content: inputValue,
        timestamp: new Date().toISOString()
      }
    ]
  }
  
  // 3. ローカルストレージに保存
  saveChatToHistory(initialChat)
  
  // 4. 詳細ページに遷移
  router.push(`/analysis/ai-agent/${chatId}?prompt=${encodeURIComponent(inputValue)}`)
}
```

## データ永続化戦略

### 1. ローカルストレージ構造

```typescript
interface ChatHistory {
  [chatId: string]: {
    id: string
    title: string
    createdAt: string
    updatedAt: string
    messages: Message[]
    status: 'active' | 'completed' | 'error'
  }
}

// localStorage key: 'ai-agent-chats'
const chats: ChatHistory = {
  "f47ac10b-58cc-4372-a567-0e02b2c3d479": {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "ワンピースの9月の売上分析",
    createdAt: "2024-10-05T14:30:00.000Z",
    updatedAt: "2024-10-05T14:35:00.000Z",
    messages: [...],
    status: "completed"
  }
}
```

### 2. タイトル自動生成

```typescript
function generateTitle(prompt: string): string {
  // キーワードから意味のあるタイトルを生成
  const keywords = extractKeywords(prompt)
  
  if (keywords.brand && keywords.timeframe) {
    return `${keywords.brand}の${keywords.timeframe}の${keywords.analysisType || '分析'}`
  }
  
  if (keywords.brand) {
    return `${keywords.brand}の${keywords.analysisType || '分析'}`
  }
  
  if (keywords.timeframe) {
    return `${keywords.timeframe}の${keywords.analysisType || '分析'}`
  }
  
  // フォールバック: 入力文の最初の20文字
  return prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt
}
```

## ページ遷移フロー

### 1. ホーム → 詳細ページ

```
[ホームページ]
    ↓ ユーザー入力 + Enter/送信
[チャットID生成]
    ↓
[ローカルストレージ保存]
    ↓
[詳細ページ遷移]
    ↓
[初期プロンプト処理開始]
```

### 2. URL構造

```
/analysis/ai-agent                     # ホームページ
/analysis/ai-agent/[chatId]            # 詳細ページ
/analysis/ai-agent/[chatId]?prompt=... # 初回遷移時（プロンプト付き）
```

### 3. 詳細ページでの初期化

```typescript
// aiAgentDetailContainer.tsx
const AiAgentDetailContainer = ({ chatId }: { chatId: string }) => {
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get('prompt')
  
  useEffect(() => {
    if (initialPrompt) {
      // 初回アクセス時は自動でプロンプト処理を開始
      processQuery(initialPrompt)
      
      // URLからプロンプトパラメータを削除（履歴をクリーンに）
      router.replace(`/analysis/ai-agent/${chatId}`)
    } else {
      // 既存チャットの読み込み
      loadExistingChat(chatId)
    }
  }, [chatId, initialPrompt])
}
```

## エラーハンドリング

### 1. 不正なチャットID

```typescript
function validateChatId(chatId: string): boolean {
  // UUID v4 形式の検証
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(chatId)
}

// 詳細ページで無効なIDの場合
if (!validateChatId(chatId) || !chatExists(chatId)) {
  // ホームページにリダイレクト
  router.replace('/analysis/ai-agent')
  return <div>チャットが見つかりません</div>
}
```

### 2. ローカルストレージの容量制限

```typescript
function manageChatHistory() {
  const chats = getAllChats()
  const maxChats = 50 // 最大保持チャット数
  
  if (Object.keys(chats).length > maxChats) {
    // 古いチャットから削除
    const sortedChats = Object.values(chats)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, maxChats)
    
    const newChats = Object.fromEntries(
      sortedChats.map(chat => [chat.id, chat])
    )
    
    localStorage.setItem('ai-agent-chats', JSON.stringify(newChats))
  }
}
```

## 履歴表示の更新

### 1. リアルタイム更新

```typescript
// ホームページの履歴一覧
const [chatHistory, setChatHistory] = useState<ChatHistory>({})

useEffect(() => {
  // 初期読み込み
  setChatHistory(getAllChats())
  
  // ストレージ変更の監視
  const handleStorageChange = () => {
    setChatHistory(getAllChats())
  }
  
  window.addEventListener('storage', handleStorageChange)
  return () => window.removeEventListener('storage', handleStorageChange)
}, [])
```

### 2. 履歴ソート・フィルタ

```typescript
const sortedHistory = Object.values(chatHistory)
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .slice(0, 10) // 最新10件のみ表示
```

## 実装ファイル配置

```
src/page-components/ai-agent/
├── home/
│   ├── lib/
│   │   ├── chat-id-generator.ts      # チャットID生成
│   │   ├── title-generator.ts        # タイトル自動生成
│   │   └── chat-history-manager.ts   # 履歴管理
│   └── model/
│       └── chat-storage-types.ts     # ストレージ型定義
└── detail/
    ├── lib/
    │   ├── chat-loader.ts             # チャット読み込み
    │   └── chat-validator.ts          # チャットID検証
    └── hooks/
        └── use-chat-initialization.ts # 初期化フック
```

## セキュリティ考慮事項

1. **チャットIDの推測防止**: UUID v4使用でランダム性確保
2. **XSS対策**: プロンプト内容のサニタイズ
3. **ローカルストレージの暗号化**: 機密性が高い場合は暗号化検討
4. **URL操作対策**: 無効なIDでのアクセス時の適切なハンドリング

## 今後の拡張性

1. **サーバーサイド同期**: 将来的なバックエンド連携
2. **チャット共有機能**: URLでのチャット共有
3. **エクスポート機能**: チャット履歴のエクスポート
4. **検索機能**: 履歴内検索