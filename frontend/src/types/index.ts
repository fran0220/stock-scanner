// 市场类型
export type MarketType = 'A' | 'US' | 'HK' // 股票市场
export type FuturesMarketType = 'CN' | 'US' // 期货市场

// 技术指标趋势
export type TrendType = 'UP' | 'DOWN'
export type SignalType = 'BUY' | 'SELL' | 'HOLD'
export type VolumeStatusType = 'HIGH' | 'NORMAL' | 'LOW'

// 股票分析结果
export interface StockAnalysisResult {
  stock_code: string
  stock_name: string
  market: MarketType
  price: number
  price_change: number
  score: number
  recommendation: string
  analysis_date: string
  ma_trend: TrendType
  rsi: number
  macd_signal: SignalType
  volume_status: VolumeStatusType
  ai_analysis?: string
}

// 期货分析结果
export interface FuturesAnalysisResult {
  futures_code: string
  futures_name: string
  market: FuturesMarketType
  price: number
  price_change: number
  score: number
  recommendation: string
  analysis_date: string
  ma_trend: TrendType
  rsi: number
  macd_signal: SignalType
  volume_status: VolumeStatusType
  open_interest_change: number
  long_short_ratio: number
  major_positions_change: number
  retail_positions_change: number
  price_momentum: number
  volatility: number
  price_deviation: number
  seasonal_performance: number
  ai_analysis?: string
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// 批量分析请求参数
export interface BatchAnalysisParams {
  codes: string[]
  market: string
  minScore: number
}
