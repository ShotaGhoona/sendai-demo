// 共通のチャット関連型定義
export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  status: 'active' | 'completed' | 'error'
}

// 実行状態関連
export interface ExecutionStatus {
  status: 'idle' | 'preview' | 'executing' | 'completed' | 'error' | 'cancelled'
  progress: number
  message?: string
  error?: string
  startTime?: string
  endTime?: string
}

// 結果表示関連
export interface ResultDisplay {
  data: Record<string, unknown>[]
  totalRows: number
  displayedRows: number
  columnInfo: ColumnInfo[]
  executionTime?: number
  sqlQuery: string
}

export interface ColumnInfo {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  format?: string
  isNullable: boolean
  maxLength?: number
}

// エラー関連
export interface ErrorInfo {
  code: string
  message: string
  details?: string
  suggestions?: string[]
  retryable: boolean
}

// ダウンロード関連
export interface DownloadOptions {
  format: 'csv' | 'json' | 'sql'
  filename?: string
  includeHeaders: boolean
  maxRows?: number
}

// 進行度関連
export interface ProgressInfo {
  current: number
  total: number
  percentage: number
  phase: 'preparing' | 'executing' | 'processing' | 'finalizing'
  estimatedTimeRemaining?: number
}

// フィードバック関連
export interface FeedbackInfo {
  type: 'good' | 'bad'
  comment?: string
  category?: 'accuracy' | 'performance' | 'usability' | 'other'
  timestamp: string
}

// 統計情報
export interface UsageStats {
  totalQueries: number
  successfulQueries: number
  errorQueries: number
  averageExecutionTime: number
  popularKeywords: string[]
  recentActivity: ActivityLog[]
}

export interface ActivityLog {
  timestamp: string
  action: 'query' | 'execute' | 'download' | 'feedback'
  details: string
}

// UI状態管理
export interface UIState {
  currentView: 'home' | 'chat' | 'results' | 'history'
  isLoading: boolean
  selectedChatId?: string
  showSidebar: boolean
  theme: 'light' | 'dark'
}

// 検索・フィルタ関連
export interface SearchFilters {
  query?: string
  dateRange?: {
    start: string
    end: string
  }
  status?: ExecutionStatus['status'][]
  hasResults?: boolean
}

// 設定関連
export interface UserPreferences {
  autoSave: boolean
  maxHistoryItems: number
  defaultDownloadFormat: 'csv' | 'json'
  showPreviewByDefault: boolean
  enableNotifications: boolean
  theme: 'light' | 'dark' | 'auto'
}

// API関連
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ErrorInfo
  metadata?: {
    timestamp: string
    version: string
    requestId: string
  }
}

// CSV関連
export interface CsvInfo {
  totalRows: number
  columns: string[]
  fileSize: number
  lastModified: string
  isLoaded: boolean
}

// キャッシュ関連
export interface CacheEntry<T = unknown> {
  key: string
  data: T
  timestamp: string
  expiresAt: string
  size: number
}

// 検証関連
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// エクスポート関連
export interface ExportData {
  chatHistory: Record<string, unknown>[]
  userPreferences: UserPreferences
  statistics: UsageStats
  exportedAt: string
  version: string
}