"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, BarChart2 } from 'lucide-react'
import StockAnalysisResult from './stock-analysis-result'

interface BatchAnalysisResultsProps {
  data: any[]
}

const BatchAnalysisResults: React.FC<BatchAnalysisResultsProps> = ({ data }) => {
  const [selectedStock, setSelectedStock] = useState<any>(null)

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">没有找到符合条件的股票</p>
        </CardContent>
      </Card>
    )
  }

  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-high'
    if (score >= 60) return 'score-medium'
    return 'score-low'
  }

  const getPriceChangeClass = (change: number) => {
    return change >= 0 ? 'market-up' : 'market-down'
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
          <CardTitle className="flex items-center">
            <BarChart2 className="mr-2 h-5 w-5" />
            批量分析结果 ({data.length} 只股票)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">股票代码</th>
                  <th className="text-left p-2">名称</th>
                  <th className="text-left p-2">市场</th>
                  <th className="text-right p-2">价格</th>
                  <th className="text-right p-2">涨跌幅</th>
                  <th className="text-right p-2">评分</th>
                  <th className="text-left p-2">建议</th>
                  <th className="text-center p-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((stock) => (
                  <tr key={`${stock.stock_code}-${stock.market}`} className="border-b hover:bg-muted/50">
                    <td className="p-2">{stock.stock_code}</td>
                    <td className="p-2">{stock.stock_name}</td>
                    <td className="p-2">{getMarketName(stock.market)}</td>
                    <td className="text-right p-2">¥{stock.price.toFixed(2)}</td>
                    <td className={`text-right p-2 ${getPriceChangeClass(stock.price_change)}`}>
                      <div className="flex items-center justify-end">
                        {stock.price_change >= 0 ? (
                          <ArrowUpIcon className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="mr-1 h-4 w-4" />
                        )}
                        {Math.abs(stock.price_change).toFixed(2)}%
                      </div>
                    </td>
                    <td className={`text-right p-2 ${getScoreClass(stock.score)}`}>
                      {stock.score}
                    </td>
                    <td className="p-2">{stock.recommendation}</td>
                    <td className="text-center p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStock(stock)}
                      >
                        详情
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedStock && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">详细分析</h3>
            <Button variant="ghost" onClick={() => setSelectedStock(null)}>
              返回列表
            </Button>
          </div>
          <StockAnalysisResult data={selectedStock} />
        </div>
      )}
    </div>
  )
}

export default BatchAnalysisResults
