"use client"

import { useState, useEffect } from "react"
import { Send, ArrowLeft, Download, Play, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "../../../../shared/ui-components/shadcnui/ui/button"
import { Input } from "../../../../shared/ui-components/shadcnui/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../shared/ui-components/shadcnui/ui/card"
import { Progress } from "../../../../shared/ui-components/shadcnui/ui/progress"
import { Badge } from "../../../../shared/ui-components/shadcnui/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../shared/ui-components/shadcnui/ui/table"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { StorageManager, ChatHistory } from "../../shared/lib/storage-manager"
import { QueryProcessor } from "../../home/lib/query-processor"
import { DownloadHelper } from "../../shared/lib/download-helper"
import { QueryResult } from "../../home/model/types"

interface AiAgentDetailContainerProps {
  chatId: string
}


export function AiAgentDetailContainer({ chatId }: AiAgentDetailContainerProps) {
  const [inputValue, setInputValue] = useState("")
  const [chat, setChat] = useState<ChatHistory | null>(null)
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryProcessor = new QueryProcessor()

  useEffect(() => {
    loadChatData()
  }, [chatId])

  const loadChatData = async () => {
    try {
      setIsLoading(true)
      const storedChat = StorageManager.getChatById(chatId)
      
      if (!storedChat) {
        router.push('/analysis/ai-agent')
        return
      }
      
      setChat(storedChat)
      
      // URLからpromptを取得して初回処理
      const prompt = searchParams.get('prompt')
      if (prompt && storedChat.status === 'preview' && !storedChat.sql) {
        await processInitialQuery(prompt, storedChat)
      }
    } catch (error) {
      console.error('Failed to load chat data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processInitialQuery = async (query: string, chatData: ChatHistory) => {
    try {
      const result = await queryProcessor.processQuery(query)
      
      const updatedChat = {
        ...chatData,
        sql: result.sql,
        keywords: result.keywords,
        preview: result.preview,
        error: result.error,
        status: result.error ? 'error' as const : 'preview' as const
      }
      
      StorageManager.saveChatHistory(updatedChat)
      setChat(updatedChat)
      setQueryResult(result)
    } catch (error) {
      console.error('Failed to process initial query:', error)
      const updatedChat = {
        ...chatData,
        error: '処理中にエラーが発生しました',
        status: 'error' as const
      }
      StorageManager.saveChatHistory(updatedChat)
      setChat(updatedChat)
    }
  }

  const handleExecuteFullQuery = async () => {
    if (!chat || !chat.sql) return
    
    try {
      setIsExecuting(true)
      setExecutionProgress(0)
      
      const result = await queryProcessor.executeFullQuery(
        chat.sql, 
        chat.keywords,
        (progress) => setExecutionProgress(progress)
      )
      
      const updatedChat = {
        ...chat,
        fullResults: result.fullResults,
        status: result.error ? 'error' as const : 'completed' as const,
        error: result.error
      }
      
      StorageManager.saveChatHistory(updatedChat)
      setChat(updatedChat)
      setQueryResult({ ...queryResult!, ...result })
    } catch (error) {
      console.error('Failed to execute full query:', error)
    } finally {
      setIsExecuting(false)
      setExecutionProgress(0)
    }
  }

  const handleDownloadCSV = () => {
    if (!chat || !queryResult?.fullResults) return
    
    try {
      const filename = DownloadHelper.sanitizeFilename(`${chat.title}_results.csv`)
      const timestampedFilename = DownloadHelper.addTimestampToFilename(filename)
      DownloadHelper.downloadCSV(queryResult.fullResults, timestampedFilename)
    } catch (error) {
      console.error('Failed to download CSV:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 追加質問の処理は後で実装
  }

  const renderTable = (data: any[], maxRows: number = 100) => {
    if (!data || data.length === 0) return null
    
    const displayData = data.slice(0, maxRows)
    const columns = Object.keys(data[0])
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="font-medium">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column}>
                    {typeof row[column] === 'number' 
                      ? row[column].toLocaleString()
                      : String(row[column] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > maxRows && (
          <p className="text-sm text-muted-foreground mt-2">
            表示中: {maxRows.toLocaleString()} / {data.length.toLocaleString()} 件
          </p>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">チャットが見つかりません</p>
          <Link href="/analysis/ai-agent">
            <Button className="mt-2">ホームに戻る</Button>
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-lg font-semibold">{chat.title}</h1>
          <div className="ml-auto flex items-center gap-2">
            {chat.status === 'completed' && queryResult?.fullResults && (
              <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSVダウンロード
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ユーザーメッセージ */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">U</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">あなた</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(chat.createdAt).toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p>{chat.query}</p>
              </div>
            </div>
          </div>

          {/* AI応答 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Image
                src="/default_pero_640x360.png"
                alt="AI Assistant"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">TREASURE AI</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(chat.updatedAt).toLocaleString('ja-JP')}
                </span>
                {chat.status === 'preview' && <Badge variant="outline">プレビュー</Badge>}
                {chat.status === 'executing' && <Badge variant="default">実行中</Badge>}
                {chat.status === 'completed' && <Badge variant="secondary">完了</Badge>}
                {chat.status === 'error' && <Badge variant="destructive">エラー</Badge>}
              </div>
              
              {chat.error ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">エラー</span>
                    </div>
                    <p className="mt-2 text-sm">{chat.error}</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="prose prose-sm max-w-none">
                    <p>{queryProcessor.generateQueryDescription(chat.keywords)}を分析します。</p>
                  </div>
                  
                  {/* SQL表示 */}
                  {chat.sql && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">生成されたSQL</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          <code>{chat.sql}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* プレビュー結果 */}
                  {chat.preview && chat.preview.length > 0 && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            プレビュー結果 ({chat.preview.length}件表示)
                          </CardTitle>
                          {chat.status === 'preview' && (
                            <Button 
                              onClick={handleExecuteFullQuery}
                              disabled={isExecuting}
                              className="flex items-center gap-2"
                            >
                              {isExecuting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                              全件実行
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderTable(chat.preview, 5)}
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* 進行度表示 */}
                  {isExecuting && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm font-medium">実行中...</span>
                        </div>
                        <Progress value={executionProgress} className="mt-3" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {executionProgress}% 完了
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* 全件結果 */}
                  {chat.status === 'completed' && queryResult?.fullResults && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            実行結果 ({queryResult.fullResults.length.toLocaleString()}件)
                          </CardTitle>
                          <Button variant="outline" onClick={handleDownloadCSV}>
                            <Download className="h-4 w-4 mr-2" />
                            CSVダウンロード
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {renderTable(queryResult.fullResults, 100)}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 入力エリア */}
      <div className="border-t px-6 py-4">
        <div className="mx-auto max-w-6xl">
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
                placeholder="追加で質問したいことを入力してください (開発中)"
                className="h-12 text-base pl-4 pr-12 rounded-full w-full"
                disabled
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled
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