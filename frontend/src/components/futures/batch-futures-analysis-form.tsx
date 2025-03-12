"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'

interface BatchFuturesAnalysisFormProps {
  onAnalyze: (codes: string[], market: string, minScore: number) => void
  isLoading: boolean
}

const BatchFuturesAnalysisForm: React.FC<BatchFuturesAnalysisFormProps> = ({ 
  onAnalyze, 
  isLoading 
}) => {
  const [futuresCodes, setFuturesCodes] = useState('')
  const [market, setMarket] = useState('CN')
  const [minScore, setMinScore] = useState(60)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const codes = futuresCodes
      .split(/[\n,，\s]+/)
      .map(code => code.trim())
      .filter(code => code.length > 0)
    
    onAnalyze(codes, market, minScore)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="batch-futures-market" className="block text-sm font-medium mb-1">
              市场
            </label>
            <select
              id="batch-futures-market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-background"
              disabled={isLoading}
            >
              <option value="CN">中国期货</option>
              <option value="US">美国期货</option>
            </select>
          </div>
          <div>
            <label htmlFor="min-score" className="block text-sm font-medium mb-1">
              最低评分
            </label>
            <input
              id="min-score"
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full p-2 rounded-md border border-input bg-background"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="futures-codes" className="block text-sm font-medium mb-1">
            期货代码列表（多个代码用逗号、空格或换行分隔）
          </label>
          <textarea
            id="futures-codes"
            value={futuresCodes}
            onChange={(e) => setFuturesCodes(e.target.value)}
            placeholder={market === 'CN' ? "输入期货代码，如: IF2403, IC2403, IH2403" : "输入期货代码，如: ES, NQ, YM"}
            className="w-full p-2 rounded-md border border-input bg-background min-h-[120px]"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || !futuresCodes.trim()}>
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                分析中...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                开始批量分析
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">批量分析说明：</h3>
        <Card>
          <CardContent className="pt-4 text-sm">
            <ul className="list-disc list-inside space-y-1">
              <li>可同时分析多个期货合约，代码之间用逗号、空格或换行分隔</li>
              <li>最低评分用于筛选结果，只显示评分大于等于该值的期货</li>
              <li>批量分析可能需要较长时间，请耐心等待</li>
              <li>建议每次批量分析不超过10个期货合约，以获得最佳性能</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}

export default BatchFuturesAnalysisForm
