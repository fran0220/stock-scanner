"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown, LineChart, BarChart, AlertCircle } from 'lucide-react'

interface FuturesAnalysisResultProps {
  data: any
}

const FuturesAnalysisResult: React.FC<FuturesAnalysisResultProps> = ({ data }) => {
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
      case 'CN': return '中国期货'
      case 'US': return '美国期货'
      default: return market
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <LineChart className="mr-2 h-5 w-5" />
              {data.futures_name} ({data.futures_code})
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-5 w-5" />
              持仓量分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">持仓量变化</span>
                  <span className={`text-sm ${data.open_interest_change && data.open_interest_change > 0 ? 'text-green-500' : data.open_interest_change && data.open_interest_change < 0 ? 'text-red-500' : ''}`}>
                    {data.open_interest_change ? `${data.open_interest_change > 0 ? '+' : ''}${data.open_interest_change.toFixed(2)}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${data.open_interest_change && data.open_interest_change > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${data.open_interest_change ? Math.min(Math.abs(data.open_interest_change), 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">持仓分析</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>多空比</span>
                    <span className={data.long_short_ratio && data.long_short_ratio > 1 ? 'text-green-500' : 'text-red-500'}>
                      {data.long_short_ratio ? data.long_short_ratio.toFixed(2) : 'N/A'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>主力持仓变化</span>
                    <span className={data.major_positions_change && data.major_positions_change > 0 ? 'text-green-500' : 'text-red-500'}>
                      {data.major_positions_change ? `${data.major_positions_change > 0 ? '+' : ''}${data.major_positions_change.toFixed(2)}%` : 'N/A'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>散户持仓变化</span>
                    <span className={data.retail_positions_change && data.retail_positions_change > 0 ? 'text-green-500' : 'text-red-500'}>
                      {data.retail_positions_change ? `${data.retail_positions_change > 0 ? '+' : ''}${data.retail_positions_change.toFixed(2)}%` : 'N/A'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              价格动量分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">价格动量</span>
                  <span className={`text-sm ${data.price_momentum && data.price_momentum > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.price_momentum ? (data.price_momentum > 0 ? '上升' : '下降') : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${data.price_momentum && data.price_momentum > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${data.price_momentum ? Math.min(Math.abs(data.price_momentum * 100), 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">价格特征</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>波动率</span>
                    <span className={data.volatility && data.volatility > 20 ? 'text-amber-500' : 'text-green-500'}>
                      {data.volatility ? `${data.volatility.toFixed(2)}%` : 'N/A'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>价格偏离度</span>
                    <span>
                      {data.price_deviation ? `${data.price_deviation.toFixed(2)}%` : 'N/A'}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>季节性表现</span>
                    <span className={data.seasonal_performance && data.seasonal_performance > 0 ? 'text-green-500' : 'text-red-500'}>
                      {data.seasonal_performance ? (data.seasonal_performance > 0 ? '强' : '弱') : 'N/A'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

export default FuturesAnalysisResult
