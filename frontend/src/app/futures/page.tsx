"use client"

import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import MainLayout from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { futuresApi } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import FuturesAnalysisForm from '@/components/futures/futures-analysis-form'
import FuturesAnalysisResult from '@/components/futures/futures-analysis-result'
import BatchFuturesAnalysisForm from '@/components/futures/batch-futures-analysis-form'
import BatchFuturesAnalysisResults from '@/components/futures/batch-futures-analysis-results'
import { Search, LineChart } from 'lucide-react'
import AnalysisProgress from '@/components/ui/analysis-progress'

export default function FuturesPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('single')
  const [symbol, setSymbol] = useState('')
  const [market, setMarket] = useState('CN')
  const [batchCodes, setBatchCodes] = useState<string[]>([])
  const [batchMarket, setBatchMarket] = useState('CN')
  const [minScore, setMinScore] = useState(60)
  const [showProgress, setShowProgress] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [showFormatGuide, setShowFormatGuide] = useState(false)
  const [analysisStep, setAnalysisStep] = useState(0)
  
  // 单个期货分析查询
  const {
    data: analysisData,
    isLoading: isAnalysisLoading,
    isError: isAnalysisError,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useQuery({
    queryKey: ['futuresAnalysis', symbol, market],
    queryFn: () => {
      console.log('执行查询函数，使用状态变量:', { symbol, market });
      return futuresApi.analyzeFutures(symbol, market);
    },
    enabled: false,
  })

  // 批量期货分析查询
  const {
    data: batchData,
    isLoading: isBatchLoading,
    isError: isBatchError,
    error: batchError,
    refetch: refetchBatch,
  } = useQuery({
    queryKey: ['batchFuturesAnalysis', batchCodes, batchMarket, minScore],
    queryFn: () => futuresApi.batchAnalyzeFutures(batchCodes, batchMarket, minScore),
    enabled: false,
  })

  // 处理单个期货分析
  const handleSingleAnalysis = async (symbolValue: string, selectedMarket: string) => {
    if (!symbolValue) {
      toast({
        title: '请输入期货代码',
        variant: 'destructive',
      })
      return
    }

    console.log('期货页面处理分析请求:', { symbolValue, selectedMarket })
    
    // 先设置状态变量
    setSymbol(symbolValue)
    setMarket(selectedMarket)
    setShowProgress(true)
    setAnalysisComplete(false)
    setAnalysisStep(0) // 重置分析步骤
    
    try {
      // 步骤1: 发送请求
      setAnalysisStep(1)
      console.log('发送期货分析请求，参数:', { symbol: symbolValue, market: selectedMarket })
      
      // 使用自定义查询函数，直接传递表单值而不是依赖状态变量
      const apiPromise = futuresApi.analyzeFutures(symbolValue, selectedMarket);
      
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
      queryClient.setQueryData(['futuresAnalysis', symbolValue, selectedMarket], result);
      
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

  // 处理批量期货分析
  const handleBatchAnalysis = async (codes: string[], selectedMarket: string, score: number) => {
    if (!codes.length) {
      toast({
        title: '请输入至少一个期货代码',
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
              <LineChart className="mr-2 h-6 w-6" />
              期货分析
            </h1>
            <p className="text-muted-foreground">
              分析国内和国际期货市场，获取技术指标和投资建议
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center">
              <Search className="mr-2 h-4 w-4" />
              单个期货分析
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center">
              <LineChart className="mr-2 h-4 w-4" />
              批量期货分析
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>单个期货分析</CardTitle>
              </CardHeader>
              <CardContent>
                <FuturesAnalysisForm 
                  onAnalyze={handleSingleAnalysis}
                  isLoading={isAnalysisLoading || showProgress}
                />
              </CardContent>
            </Card>

            {showProgress && (
              <AnalysisProgress 
                isVisible={showProgress} 
                analysisType="futures" 
                code={symbol}
                onComplete={handleAnalysisComplete}
                currentStep={analysisStep}
                isApiLoading={isAnalysisLoading || !analysisComplete}
                isApiError={isAnalysisError}
                errorMessage={isAnalysisError ? (analysisError as Error)?.message : ''}
              />
            )}

            {analysisData && !isAnalysisLoading && !isAnalysisError && (
              <FuturesAnalysisResult data={analysisData.data} />
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
                      期货代码格式:
                    </p>
                    <ul className="list-disc pl-5 text-sm">
                      <li><strong>中国期货：</strong></li>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>股指期货：IF（沪深300）、IC（中证500）、IH（上证50）</li>
                        <li>商品期货：例如 CU（铜）、AU（黄金）、RB（螺纹钢）</li>
                        <li>通常包含月份和年份，如 IF2403 表示 2024年3月到期的沪深300指数期货</li>
                      </ul>
                      <li><strong>美国期货：</strong></li>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>ES（标普500）、NQ（纳斯达克）、YM（道琼斯）</li>
                        <li>CL（原油）、GC（黄金）、SI（白银）</li>
                        <li>可以输入基础代码（如ES）或包含月份的完整代码（如ESH24）</li>
                      </ul>
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
                <CardTitle>批量期货分析</CardTitle>
              </CardHeader>
              <CardContent>
                <BatchFuturesAnalysisForm 
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
              <BatchFuturesAnalysisResults data={batchData.data} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
