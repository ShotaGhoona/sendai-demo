"use client"

import { useState, useEffect } from "react"
import { Send } from "lucide-react"
import { Button } from "@/shared/ui-components/shadcnui/ui/button"
import { Input } from "@/shared/ui-components/shadcnui/ui/input"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { StorageManager, ChatHistory } from "../../shared/lib/storage-manager"
import { QueryProcessor } from "../lib/query-processor"


export function AiAgentContainer() {
  const [inputValue, setInputValue] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const queryProcessor = new QueryProcessor()

  useEffect(() => {
    // 履歴を読み込み
    const loadHistory = () => {
      const history = StorageManager.getChatHistory()
      setChatHistory(history.slice(0, 10)) // 最新10件のみ表示
    }
    
    loadHistory()
    
    // CSVデータの事前読み込み
    queryProcessor.preloadData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    setIsLoading(true)
    
    try {
      // 新しいチャットIDを生成
      const chatId = uuidv4()
      
      // 基本的なタイトルを生成（最初の30文字程度）
      const title = inputValue.length > 30 
        ? inputValue.substring(0, 30) + "..."
        : inputValue
      
      // チャット履歴を作成
      const newChat: ChatHistory = {
        id: chatId,
        title,
        query: inputValue,
        sql: '',
        keywords: {},
        preview: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'preview'
      }
      
      // ローカルストレージに保存
      StorageManager.saveChatHistory(newChat)
      StorageManager.saveCurrentChat(chatId)
      
      // チャット詳細ページに遷移
      router.push(`/analysis/ai-agent/${chatId}?prompt=${encodeURIComponent(inputValue)}`)
    } catch (error) {
      console.error('Failed to create chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistoryClick = (chatId: string) => {
    StorageManager.saveCurrentChat(chatId)
    router.push(`/analysis/ai-agent/${chatId}`)
  }


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) {
      return '今'
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else if (diffDays < 7) {
      return `${diffDays}日前`
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    }
  }


  return (
    <div className="flex h-screen flex-col">
      {/* ヘッダー */}
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-semibold">TREASURE AI エージェント</h1>
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-1 flex-col relative">
        {/* コンテンツエリア */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-8">
            
            
            {/* 履歴セクション */}
            {chatHistory.length > 0 && (
              <div className="space-y-3">
                {chatHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="cursor-pointer transition-colors hover:bg-muted/50 p-3 rounded-lg border-b border-border/50"
                    onClick={() => handleHistoryClick(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </h3>
                      </div>
                      <div className="text-xs text-muted-foreground ml-4">
                        {formatDate(item.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* チャット入力エリア（履歴の上に固定） */}
        <div className="absolute bottom-0 left-0 right-0 bg-background border-t px-6 py-8">
          <div className="mx-auto max-w-5xl">
            <form onSubmit={handleSubmit} className="flex gap-3 items-center">
              <div className="flex-shrink-0">
                <Image
                  src="/default_pero_640x360.png"
                  alt="AI Assistant"
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="relative flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="分析したい内容を入力してください（例：ワンピースの9月の売り上げを教えて）"
                  className="h-16 text-base pl-4 pr-12 rounded-full w-full"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}