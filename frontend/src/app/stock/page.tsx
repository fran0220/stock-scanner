"use client"

import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import MainLayout from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { stockApi } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import StockAnalysisForm from '@/components/stock/stock-analysis-form'
import StockAnalysisResult from '@/components/stock/stock-analysis-result'
import BatchAnalysisForm from '@/components/stock/batch-analysis-form'
import BatchAnalysisResults from '@/components/stock/batch-analysis-results'
import { Search, BarChart2 } from 'lucide-react'
import AnalysisProgress from '@/components/ui/analysis-progress'

export default function StockPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('single')
  const [stockCode, setStockCode] = useState('')
  const [market, setMarket] = useState('A')
  const [batchCodes, setBatchCodes] = useState<string[]>([])
  const [batchMarket, setBatchMarket] = useState('A')
  const [minScore, setMinScore] = useState(60)
  const [showProgress, setShowProgress] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [showFormatGuide, setShowFormatGuide] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  
  // 单只股票分析查询
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isError: isAnalysisError,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useQuery({
    queryKey: ['stockAnalysis', stockCode, market],
    queryFn: () => {
      console.log('执行查询函数，使用状态变量:', { stockCode, market });
      return stockApi.analyzeStock(stockCode, market);
    },
    enabled: false,
  })

  // 批量股票分析查询
  const {
    data: batchData,
    isLoading: isBatchLoading,
    isError: isBatchError,
    error: batchError,
    refetch: refetchBatch,
  } = useQuery({
    queryKey: ['batchStockAnalysis', batchCodes, batchMarket, minScore],
    queryFn: () => stockApi.batchAnalyzeStocks(batchCodes, batchMarket, minScore),
    enabled: false,
  })

  // 处理单只股票分析
  const handleSingleAnalysis = async (code: string, selectedMarket: string) => {
    if (!code) {
      toast({
        title: '请输入股票代码',
        variant: 'destructive',
      })
      return
    }

    console.log('股票页面处理分析请求:', { code, selectedMarket })
    setStockCode(code)
    setMarket(selectedMarket)
    setShowProgress(true)
    setAnalysisComplete(false)
    setAnalysisStep(0) // 重置分析步骤
    
    try {
      // 步骤1: 发送请求
      setAnalysisStep(1)
      console.log('发送股票分析请求，参数:', { stockCode: code, market: selectedMarket })
      
      // 使用自定义查询函数，直接传递表单值而不是依赖状态变量
      const apiPromise = stockApi.analyzeStock(code, selectedMarket);
      
      // 模拟各个步骤的进度，同时等待API响应
      // 步骤2: 获取数据
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalysisStep(2)
      
      // 步骤3: 基础分析
      await new Promise(resolve => setTimeout(resolve, 1200))
      setAnalysisStep(3)
      
      // 步骤4: 技术指标分析
      await new Promise(resolve => setTimeout(resolve, 1500))
      setAnalysisStep(4)
      
      // 步骤5: AI评估
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAnalysisStep(5)
      
      // 等待API响应完成
      const result = await apiPromise;
      
      // 手动更新查询缓存
      queryClient.setQueryData(['stockAnalysis', code, selectedMarket], result);
      
      // 分析完成，设置最终状态
      setAnalysisComplete(true)
      
      // 减少在100%时的等待时间
      setTimeout(() => {
        setShowProgress(false)
      }, 500)
    } catch (error: any) {
      toast({
        title: '分析失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      })
      setShowProgress(false)
    }
  }

  // 处理批量股票分析
  const handleBatchAnalysis = async (codes: string[], selectedMarket: string, score: number) => {
    if (!codes.length) {
      toast({
        title: '请输入至少一个股票代码',
        variant: 'destructive',
      })
      return
    }

    setBatchCodes(codes)
    setBatchMarket(selectedMarket)
    setMinScore(score)
    
    try {
      await refetchBatch()
    } catch (error: any) {
      toast({
        title: '批量分析失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  // 分析完成处理函数
  const handleAnalysisComplete = () => {
    setAnalysisComplete(true)
    setTimeout(() => {
      setShowProgress(false)
    }, 500)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <BarChart2 className="mr-2 h-6 w-6" />
              股票分析
            </h1>
            <p className="text-muted-foreground">
              分析A股、美股和港股，获取技术指标和投资建议
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              单只股票分析
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4" />
              批量股票分析
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>单只股票分析</CardTitle>
              </CardHeader>
              <CardContent>
                <StockAnalysisForm 
                  onAnalyze={handleSingleAnalysis}
                  isLoading={isAnalysisLoading || showProgress}
                />
              </CardContent>
            </Card>

            {showProgress && (
              <AnalysisProgress 
                isVisible={showProgress} 
                analysisType="stock" 
                code={stockCode}
                onComplete={handleAnalysisComplete}
                currentStep={analysisStep}
                isApiLoading={isAnalysisLoading || !analysisComplete}
                isApiError={isAnalysisError}
                errorMessage={isAnalysisError ? (analysisError as Error)?.message : ''}
              />
            )}

            {analysisData && !isAnalysisLoading && !isAnalysisError && (
              <StockAnalysisResult data={analysisData.data} />
            )}
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFormatGuide(!showFormatGuide)}
                className="text-xs"
              >
                {showFormatGuide ? '隐藏格式说明' : '显示格式说明'}
              </Button>
            </div>
            
            {showFormatGuide && (
              <Card className="mt-2">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">代码格式说明</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      股票代码格式:
                    </p>
                    <ul className="list-disc pl-5 text-sm">
                      <li>A股: 6位数字，如 <code>000001</code>、<code>600000</code></li>
                      <li>美股: 1-5个字母，如 <code>AAPL</code>、<code>MSFT</code>、<code>GOOG</code></li>
                      <li>港股: 5位数字，如 <code>00700</code>、<code>09988</code></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {isAnalysisError && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">分析出错: {(analysisError as Error)?.message || '请稍后重试'}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => refetchAnalysis()}
                  >
                    重试
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="batch" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>批量股票分析</CardTitle>
              </CardHeader>
              <CardContent>
                <BatchAnalysisForm 
                  onAnalyze={handleBatchAnalysis}
                  isLoading={isBatchLoading}
                />
              </CardContent>
            </Card>

            {isBatchLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}

            {isBatchError && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">批量分析出错: {(batchError as Error)?.message || '请稍后重试'}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => refetchBatch()}
                  >
                    重试
                  </Button>
                </CardContent>
              </Card>
            )}

            {batchData && !isBatchLoading && !isBatchError && (
              <BatchAnalysisResults data={batchData.data} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
