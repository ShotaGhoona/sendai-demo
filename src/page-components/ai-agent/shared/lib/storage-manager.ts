import { ExtractedKeywords } from '../../home/model/types'

export interface ChatHistory {
  id: string
  title: string
  query: string
  sql: string
  keywords: ExtractedKeywords
  preview: Record<string, unknown>[]
  fullResults?: Record<string, unknown>[]
  createdAt: string
  updatedAt: string
  status: 'preview' | 'executing' | 'completed' | 'error'
  feedback?: 'good' | 'bad'
  error?: string
}

export class StorageManager {
  private static readonly CHAT_HISTORY_KEY = 'ai_agent_chat_history'
  private static readonly CURRENT_CHAT_KEY = 'ai_agent_current_chat'
  private static readonly MAX_HISTORY_COUNT = 50

  // チャット履歴を取得
  static getChatHistory(): ChatHistory[] {
    try {
      const stored = localStorage.getItem(this.CHAT_HISTORY_KEY)
      if (!stored) return []
      
      const history = JSON.parse(stored) as ChatHistory[]
      // 新しい順にソート
      return history.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error('Failed to load chat history:', error)
      return []
    }
  }

  // チャット履歴を保存
  static saveChatHistory(chat: ChatHistory): void {
    try {
      const history = this.getChatHistory()
      const existingIndex = history.findIndex(h => h.id === chat.id)
      
      if (existingIndex >= 0) {
        // 既存のチャットを更新
        history[existingIndex] = { ...chat, updatedAt: new Date().toISOString() }
      } else {
        // 新しいチャットを追加
        history.unshift({ ...chat, updatedAt: new Date().toISOString() })
      }

      // 履歴数制限
      const limitedHistory = history.slice(0, this.MAX_HISTORY_COUNT)
      
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(limitedHistory))
    } catch (error) {
      console.error('Failed to save chat history:', error)
    }
  }

  // 特定のチャットを取得
  static getChatById(chatId: string): ChatHistory | null {
    try {
      const history = this.getChatHistory()
      return history.find(chat => chat.id === chatId) || null
    } catch (error) {
      console.error('Failed to get chat by id:', error)
      return null
    }
  }

  // チャットを削除
  static deleteChatById(chatId: string): void {
    try {
      const history = this.getChatHistory()
      const filteredHistory = history.filter(chat => chat.id !== chatId)
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(filteredHistory))
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  // 現在のチャット状態を保存
  static saveCurrentChat(chatId: string): void {
    try {
      localStorage.setItem(this.CURRENT_CHAT_KEY, chatId)
    } catch (error) {
      console.error('Failed to save current chat:', error)
    }
  }

  // 現在のチャット状態を取得
  static getCurrentChatId(): string | null {
    try {
      return localStorage.getItem(this.CURRENT_CHAT_KEY)
    } catch (error) {
      console.error('Failed to get current chat:', error)
      return null
    }
  }

  // 現在のチャット状態をクリア
  static clearCurrentChat(): void {
    try {
      localStorage.removeItem(this.CURRENT_CHAT_KEY)
    } catch (error) {
      console.error('Failed to clear current chat:', error)
    }
  }

  // 全履歴をクリア
  static clearAllHistory(): void {
    try {
      localStorage.removeItem(this.CHAT_HISTORY_KEY)
      localStorage.removeItem(this.CURRENT_CHAT_KEY)
    } catch (error) {
      console.error('Failed to clear all history:', error)
    }
  }

  // 最近のクエリを取得（入力補完用）
  static getRecentQueries(limit: number = 10): string[] {
    try {
      const history = this.getChatHistory()
      const queries = history
        .map(chat => chat.query)
        .filter((query, index, arr) => arr.indexOf(query) === index) // 重複除去
        .slice(0, limit)
      
      return queries
    } catch (error) {
      console.error('Failed to get recent queries:', error)
      return []
    }
  }

  // 統計情報を取得
  static getStats(): {
    totalChats: number
    completedChats: number
    errorChats: number
    averageResponseTime?: number
  } {
    try {
      const history = this.getChatHistory()
      
      return {
        totalChats: history.length,
        completedChats: history.filter(chat => chat.status === 'completed').length,
        errorChats: history.filter(chat => chat.status === 'error').length
      }
    } catch (error) {
      console.error('Failed to get stats:', error)
      return {
        totalChats: 0,
        completedChats: 0,
        errorChats: 0
      }
    }
  }

  // フィードバックを更新
  static updateFeedback(chatId: string, feedback: 'good' | 'bad'): void {
    try {
      const chat = this.getChatById(chatId)
      if (chat) {
        chat.feedback = feedback
        this.saveChatHistory(chat)
      }
    } catch (error) {
      console.error('Failed to update feedback:', error)
    }
  }

  // エクスポート用データを生成
  static exportChatData(chatId?: string): string {
    try {
      const history = chatId 
        ? [this.getChatById(chatId)].filter((chat): chat is ChatHistory => chat !== null)
        : this.getChatHistory()
      
      const exportData = history.map(chat => ({
        id: chat.id,
        title: chat.title,
        query: chat.query,
        sql: chat.sql,
        status: chat.status,
        createdAt: chat.createdAt,
        feedback: chat.feedback,
        resultCount: chat.fullResults?.length || chat.preview?.length || 0
      }))

      return JSON.stringify(exportData, null, 2)
    } catch (error) {
      console.error('Failed to export chat data:', error)
      return '[]'
    }
  }
}