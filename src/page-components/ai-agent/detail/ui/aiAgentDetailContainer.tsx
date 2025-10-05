"use client"

import { useState } from "react"
import { Send, ArrowLeft, Download } from "lucide-react"
import { Button } from "../../../../shared/ui-components/shadcnui/ui/button"
import { Input } from "../../../../shared/ui-components/shadcnui/ui/input"
import { Card, CardContent } from "../../../../shared/ui-components/shadcnui/ui/card"
import Image from "next/image"
import Link from "next/link"

interface AiAgentDetailContainerProps {
  chatId: string
}

// サンプルチャットデータ
const sampleChat = {
  id: "1",
  title: "ワンピースの9月の売上分析",
  messages: [
    {
      id: "1",
      type: "user" as const,
      content: "ワンピースの9月の売り上げを教えて",
      timestamp: "2024-10-05 14:30"
    },
    {
      id: "2",
      type: "assistant" as const,
      content: "ワンピース関連商品の9月売上を分析します。",
      timestamp: "2024-10-05 14:30",
      sql: "SELECT brand, SUM(sale_price * quantity) as total_sales FROM sales_data WHERE brand = 'ワンピース' AND MONTH(sale_date) = 9 GROUP BY brand",
      results: [
        { brand: "ワンピース", total_sales: 15420000 }
      ]
    }
  ]
}

export function AiAgentDetailContainer({ chatId }: AiAgentDetailContainerProps) {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState(sampleChat.messages)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        type: "user" as const,
        content: inputValue,
        timestamp: new Date().toLocaleString("ja-JP")
      }
      setMessages([...messages, newMessage])
      setInputValue("")
      
      // TODO: AI応答の処理
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* ヘッダー */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/analysis/ai-agent">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">{sampleChat.title}</h1>
          <div className="ml-auto">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              CSVダウンロード
            </Button>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              {/* アバター */}
              <div className="flex-shrink-0">
                {message.type === "user" ? (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">U</span>
                  </div>
                ) : (
                  <Image
                    src="/default_pero_640x360.png"
                    alt="AI Assistant"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                )}
              </div>
              
              {/* メッセージ内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">
                    {message.type === "user" ? "あなた" : "TREASURE AI"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp}
                  </span>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p>{message.content}</p>
                </div>
                
                {/* AI応答の場合、SQLと結果を表示 */}
                {message.type === "assistant" && "sql" in message && (
                  <div className="mt-4 space-y-4">
                    {/* SQL */}
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">生成されたSQL</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          <code>{message.sql}</code>
                        </pre>
                      </CardContent>
                    </Card>
                    
                    {/* 結果 */}
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">実行結果</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">ブランド</th>
                                <th className="text-left p-2">売上合計</th>
                              </tr>
                            </thead>
                            <tbody>
                              {message.results?.map((row, index) => (
                                <tr key={index} className="border-b">
                                  <td className="p-2">{row.brand}</td>
                                  <td className="p-2">¥{row.total_sales.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 入力エリア */}
      <div className="border-t px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <div className="flex-shrink-0">
              <Image
                src="/default_pero_640x360.png"
                alt="AI Assistant"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            </div>
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="追加で質問したいことを入力してください"
                className="h-12 text-base pl-4 pr-12 rounded-full w-full"
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}