"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpIcon, ArrowDownIcon, LineChart } from 'lucide-react'
import FuturesAnalysisResult from './futures-analysis-result'

interface BatchFuturesAnalysisResultsProps {
  data: any[]
}

const BatchFuturesAnalysisResults: React.FC<BatchFuturesAnalysisResultsProps> = ({ data }) => {
  const [selectedFutures, setSelectedFutures] = useState<any>(null)

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">没有找到符合条件的期货</p>
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
      case 'CN': return '中国期货'
      case 'US': return '美国期货'
      default: return market
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="mr-2 h-5 w-5" />
            批量分析结果 ({data.length} 个期货)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">期货代码</th>
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
                {data.map((futures) => (
                  <tr key={`${futures.futures_code}-${futures.market}`} className="border-b hover:bg-muted/50">
                    <td className="p-2">{futures.futures_code}</td>
                    <td className="p-2">{futures.futures_name}</td>
                    <td className="p-2">{getMarketName(futures.market)}</td>
                    <td className="text-right p-2">¥{futures.price.toFixed(2)}</td>
                    <td className={`text-right p-2 ${getPriceChangeClass(futures.price_change)}`}>
                      <div className="flex items-center justify-end">
                        {futures.price_change >= 0 ? (
                          <ArrowUpIcon className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="mr-1 h-4 w-4" />
                        )}
                        {Math.abs(futures.price_change).toFixed(2)}%
                      </div>
                    </td>
                    <td className={`text-right p-2 ${getScoreClass(futures.score)}`}>
                      {futures.score}
                    </td>
                    <td className="p-2">{futures.recommendation}</td>
                    <td className="text-center p-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFutures(futures)}
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

      {selectedFutures && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">详细分析</h3>
            <Button variant="ghost" onClick={() => setSelectedFutures(null)}>
              返回列表
            </Button>
          </div>
          <FuturesAnalysisResult data={selectedFutures} />
        </div>
      )}
    </div>
  )
}

export default BatchFuturesAnalysisResults
