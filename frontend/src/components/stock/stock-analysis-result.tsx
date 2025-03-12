"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown, BarChart2, AlertCircle } from 'lucide-react'

interface StockAnalysisResultProps {
  data: any
}

const StockAnalysisResult: React.FC<StockAnalysisResultProps> = ({ data }) => {
  if (!data) return null

  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-high'
    if (score >= 60) return 'score-medium'
    return 'score-low'
  }

  const getPriceChangeClass = (change: number) => {
    return change >= 0 ? 'market-up' : 'market-down'
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd')
    } catch (e) {
      return dateString
    }
  }

  const getMarketName = (market: string) => {
    switch (market) {
      case 'A': return 'A股'
      case 'US': return '美股'
      case 'HK': return '港股'
      default: return market
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              {data.stock_name} ({data.stock_code})
            </div>
            <div className="text-sm font-normal">
              {getMarketName(data.market)} | 分析日期: {formatDate(data.analysis_date)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="analysis-card">
              <h3 className="text-lg font-medium mb-2">综合评分</h3>
              <div className="flex items-center justify-between">
                <div className={`text-3xl font-bold ${getScoreClass(data.score)}`}>
                  {data.score}
                </div>
                <div className="text-lg font-medium">
                  {data.recommendation}
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h3 className="text-lg font-medium mb-2">价格信息</h3>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  ¥{data.price ? data.price.toFixed(2) : 'N/A'}
                </div>
                <div className={`flex items-center ${getPriceChangeClass(data.price_change || 0)}`}>
                  {data.price_change >= 0 ? (
                    <ArrowUpIcon className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-4 w-4" />
                  )}
                  {data.price_change ? Math.abs(data.price_change).toFixed(2) : '0.00'}%
                </div>
              </div>
            </div>

            <div className="analysis-card">
              <h3 className="text-lg font-medium mb-2">技术指标</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">MA趋势</div>
                  <div className="flex items-center">
                    {data.ma_trend === 'UP' ? (
                      <>
                        <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                        <span className="text-green-500">上升</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                        <span className="text-red-500">下降</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">RSI</div>
                  <div className="font-medium">
                    {data.rsi ? data.rsi.toFixed(2) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">MACD信号</div>
                  <div className={data.macd_signal === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                    {data.macd_signal === 'BUY' ? '买入' : '卖出'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">成交量</div>
                  <div className={data.volume_status === 'HIGH' ? 'text-green-500' : ''}>
                    {data.volume_status === 'HIGH' ? '放量' : '正常'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.ai_analysis ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              AI分析结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">{data.ai_analysis}</pre>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">暂无AI分析结果</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default StockAnalysisResult
