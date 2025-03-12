"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './card'
import { Progress } from './progress'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface AnalysisStep {
  id: string
  name: string
  status: 'waiting' | 'processing' | 'completed' | 'error'
  message?: string
}

interface AnalysisProgressProps {
  isVisible: boolean
  analysisType: 'stock' | 'futures'
  code: string
  onComplete?: () => void
  // 新增属性，用于接收实际进度
  currentStep?: number
  isApiLoading?: boolean
  isApiError?: boolean
  errorMessage?: string
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ 
  isVisible, 
  analysisType, 
  code,
  onComplete,
  currentStep = 0,
  isApiLoading = true,
  isApiError = false,
  errorMessage = ''
}) => {
  // 定义分析步骤
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 'request', name: '发送请求', status: 'waiting' },
    { id: 'fetch', name: '获取数据', status: 'waiting' },
    { id: 'basic', name: '基础分析', status: 'waiting' },
    { id: 'technical', name: '技术指标分析', status: 'waiting' },
    { id: 'ai', name: 'AI评估', status: 'waiting' },
    { id: 'score', name: '生成评分和建议', status: 'waiting' }
  ])
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasError, setHasError] = useState(false)

  // 根据API状态更新进度
  useEffect(() => {
    if (!isVisible) {
      // 重置状态
      setSteps(steps.map(step => ({ ...step, status: 'waiting' })))
      setProgress(0)
      setCurrentStepIndex(0)
      setIsCompleted(false)
      setHasError(false)
      return
    }

    // 如果API出错
    if (isApiError) {
      setHasError(true)
      // 找到当前步骤并标记为错误
      setSteps(prevSteps => {
        const newSteps = [...prevSteps]
        const currentStep = Math.min(currentStepIndex, newSteps.length - 1)
        newSteps[currentStep] = { 
          ...newSteps[currentStep], 
          status: 'error',
          message: errorMessage || '分析过程中出错'
        }
        return newSteps
      })
      return
    }

  // 如果API加载完成
  if (!isApiLoading) {
    // 将所有步骤标记为完成
    setSteps(prevSteps => 
      prevSteps.map(step => ({ ...step, status: 'completed' }))
    )
    setProgress(100)
    setIsCompleted(true)
    if (onComplete) {
      setTimeout(() => {
        onComplete()
      }, 1000)
    }
    return
  }

    // 模拟分析过程 - 基于实际API调用状态
    const updateProgress = async () => {
      // 计算当前步骤
      const apiStep = Math.min(currentStep, steps.length - 1)
      setCurrentStepIndex(apiStep)
      
      // 更新进度条
      const stepProgress = Math.floor((apiStep / (steps.length - 1)) * 100)
      setProgress(stepProgress)
      
      // 更新步骤状态
      setSteps(prevSteps => {
        const newSteps = [...prevSteps]
        // 将当前步骤之前的所有步骤标记为已完成
        for (let i = 0; i < apiStep; i++) {
          newSteps[i] = { ...newSteps[i], status: 'completed' }
        }
        // 将当前步骤标记为处理中
        newSteps[apiStep] = { ...newSteps[apiStep], status: 'processing' }
        return newSteps
      })
    }

    updateProgress()
  }, [isVisible, code, currentStep, isApiLoading, isApiError, errorMessage])

  if (!isVisible) return null

  return (
    <Card className="w-full mb-4 border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium flex items-center">
              {analysisType === 'stock' ? '股票' : '期货'}分析进度: {code}
            </h3>
            <div className="text-sm font-medium text-primary">
              {progress}% 完成
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="space-y-2 mt-4 max-h-[180px] overflow-y-auto pr-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center py-1 border-b border-muted/30 last:border-0">
                {step.status === 'waiting' && (
                  <div className="h-5 w-5 rounded-full border border-muted-foreground/30 mr-2"></div>
                )}
                {step.status === 'processing' && (
                  <Loader2 className="h-5 w-5 text-primary mr-2" />
                )}
                {step.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-destructive mr-2" />
                )}
                
                <span className={`text-sm ${
                  step.status === 'processing' ? 'text-primary font-medium' :
                  step.status === 'completed' ? 'text-green-500' :
                  step.status === 'error' ? 'text-destructive' :
                  index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.name}
                </span>
                
                {step.status === 'error' && step.message && (
                  <span className="ml-2 text-xs text-destructive">
                    ({step.message})
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {isCompleted && (
            <div className="flex items-center justify-center py-2 text-green-500 bg-green-50 rounded-md">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">分析完成！正在加载结果...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AnalysisProgress
