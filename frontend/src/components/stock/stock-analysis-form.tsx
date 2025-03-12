"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface StockAnalysisFormProps {
  onAnalyze: (code: string, market: string) => void
  isLoading: boolean
}

const StockAnalysisForm: React.FC<StockAnalysisFormProps> = ({ 
  onAnalyze, 
  isLoading 
}) => {
  const [stockCode, setStockCode] = useState('')
  const [market, setMarket] = useState('A')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('提交股票分析表单:', { stockCode, market })
    onAnalyze(stockCode, market)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <label htmlFor="market" className="block text-sm font-medium mb-1">
              市场
            </label>
            <select
              id="market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-background"
              disabled={isLoading}
            >
              <option value="A">A股</option>
              <option value="US">美股</option>
              <option value="HK">港股</option>
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="stockCode" className="block text-sm font-medium mb-1">
              股票代码
            </label>
            <input
              id="stockCode"
              type="text"
              value={stockCode}
              onChange={(e) => setStockCode(e.target.value)}
              placeholder={market === 'A' ? "输入股票代码，如: 600000" : market === 'US' ? "输入股票代码，如: AAPL" : "输入股票代码，如: 00700"}
              className="w-full p-2 rounded-md border border-input bg-background"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || !stockCode}>
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

export default StockAnalysisForm
