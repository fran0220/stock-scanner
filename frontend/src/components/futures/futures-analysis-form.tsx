"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface FuturesAnalysisFormProps {
  onAnalyze: (symbol: string, market: string) => void
  isLoading: boolean
}

const FuturesAnalysisForm: React.FC<FuturesAnalysisFormProps> = ({ 
  onAnalyze, 
  isLoading 
}) => {
  const [symbol, setSymbol] = useState('')
  const [market, setMarket] = useState('CN')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('提交期货分析表单:', { symbol, market })
    onAnalyze(symbol, market)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <label htmlFor="futures-market" className="block text-sm font-medium mb-1">
              市场
            </label>
            <select
              id="futures-market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-background"
              disabled={isLoading}
            >
              <option value="CN">中国期货</option>
              <option value="US">美国期货</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="symbol" className="block text-sm font-medium mb-1">
              期货代码
            </label>
            <input
              id="symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder={market === 'CN' ? "输入期货代码，如: IF2403" : "输入期货代码，如: ES"}
              className="w-full p-2 rounded-md border border-input bg-background"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || !symbol}>
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                分析中...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                开始分析
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default FuturesAnalysisForm
