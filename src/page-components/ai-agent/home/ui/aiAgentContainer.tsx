"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/shared/ui-components/shadcnui/ui/button"
import { Input } from "@/shared/ui-components/shadcnui/ui/input"
import Image from "next/image"

// サンプル履歴データ
const sampleHistory = [
  {
    id: 1,
    title: "ワンピースの9月の売上分析",
    description: "ワンピース関連商品の9月売上データを集計・分析",
    date: "10月5日"
  },
  {
    id: 2,
    title: "鬼滅の刃グッズの売上推移",
    description: "鬼滅の刃関連商品の月別売上推移を確認",
    date: "10月1日"
  },
  {
    id: 3,
    title: "フィギュア売上ランキング",
    description: "フィギュアカテゴリの売上上位商品を分析",
    date: "9月30日"
  },
  {
    id: 4,
    title: "店舗別売上比較",
    description: "地域別・店舗別の売上実績を比較分析",
    date: "9月29日"
  },
  {
    id: 5,
    title: "季節商品の売上傾向",
    description: "夏季商品と秋季商品の売上傾向を分析",
    date: "9月28日"
  }
]

export function AiAgentContainer() {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      console.log("送信:", inputValue)
      setInputValue("")
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
        {/* 履歴エリア（下半分） */}
        <div className="h-1/2 px-6 py-6 overflow-y-auto">
          <div className="mx-auto max-w-5xl">
            <div className="divide-y divide-border">
              {sampleHistory.map((item) => (
                <div key={item.id} className="cursor-pointer py-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-muted-foreground">{item.title}</h3>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  )
}