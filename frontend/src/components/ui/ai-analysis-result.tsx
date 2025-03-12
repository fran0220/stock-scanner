"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Lightbulb, TrendingUp, BarChart2, AlertTriangle } from 'lucide-react'

interface AIAnalysisResultProps {
  content: string
  title?: string
}

const AIAnalysisResult: React.FC<AIAnalysisResultProps> = ({ 
  content, 
  title = 'AI分析结果' 
}) => {
  if (!content) return null

  // 将Markdown内容转换为HTML
  const htmlContent = formatMarkdownToHtml(content)
  
  // 解析Markdown内容，提取关键部分
  const sections = parseMarkdownSections(content)

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <AlertCircle className="mr-2 h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 使用结构化布局显示分析结果 */}
        {(sections.summary || sections.technicalAnalysis || 
          sections.fundamentalAnalysis || sections.recommendation || 
          sections.risks) ? (
          <>
            {/* 摘要部分 */}
            {sections.summary && (
              <div className="mb-4 p-3 bg-primary/5 rounded-md">
                <h3 className="text-md font-medium flex items-center mb-2 text-primary">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  摘要
                </h3>
                <div className="text-sm" 
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdownToHtml(sections.summary) 
                  }} 
                />
              </div>
            )}

            {/* 技术分析和基本面分析 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {sections.technicalAnalysis && (
                <div className="p-3 border rounded-md">
                  <h3 className="text-md font-medium flex items-center mb-2">
                    <TrendingUp className="mr-2 h-4 w-4 text-blue-500" />
                    技术分析
                  </h3>
                  <div className="text-sm" 
                    dangerouslySetInnerHTML={{ 
                      __html: formatMarkdownToHtml(sections.technicalAnalysis) 
                    }} 
                  />
                </div>
              )}

              {sections.fundamentalAnalysis && (
                <div className="p-3 border rounded-md">
                  <h3 className="text-md font-medium flex items-center mb-2">
                    <BarChart2 className="mr-2 h-4 w-4 text-indigo-500" />
                    基本面分析
                  </h3>
                  <div className="text-sm" 
                    dangerouslySetInnerHTML={{ 
                      __html: formatMarkdownToHtml(sections.fundamentalAnalysis) 
                    }} 
                  />
                </div>
              )}
            </div>

            {/* 投资建议 */}
            {sections.recommendation && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <h3 className="text-md font-medium flex items-center mb-2 text-green-600 dark:text-green-400">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  投资建议
                </h3>
                <div className="text-sm" 
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdownToHtml(sections.recommendation) 
                  }} 
                />
              </div>
            )}

            {/* 风险提示 */}
            {sections.risks && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <h3 className="text-md font-medium flex items-center mb-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  风险提示
                </h3>
                <div className="text-sm" 
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdownToHtml(sections.risks) 
                  }} 
                />
              </div>
            )}
          </>
        ) : (
          // 如果没有识别出特定部分，则显示完整内容
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 将Markdown转换为HTML
function formatMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // 替换标题
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-bold my-2">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold my-2">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold my-2">$1</h3>');
  
  // 替换列表项
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>');
  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>');
  
  // 替换加粗和斜体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // 替换换行符为<br>标签
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

// 解析Markdown内容，提取不同部分
function parseMarkdownSections(markdown: string) {
  const sections: {
    summary?: string;
    technicalAnalysis?: string;
    fundamentalAnalysis?: string;
    recommendation?: string;
    risks?: string;
  } = {}

  // 尝试提取摘要（通常在开头）
  const summaryMatch = markdown.match(/^([^#]+)(?=#|$)/)
  if (summaryMatch && summaryMatch[1].trim()) {
    sections.summary = summaryMatch[1].trim()
  }

  // 尝试提取技术分析部分
  const technicalMatch = markdown.match(/(?:##?\s*技术分析|##?\s*趋势分析|##?\s*Technical Analysis)[^\n]*\n([\s\S]*?)(?=##|$)/i)
  if (technicalMatch && technicalMatch[1].trim()) {
    sections.technicalAnalysis = technicalMatch[1].trim()
  }

  // 尝试提取基本面分析部分
  const fundamentalMatch = markdown.match(/(?:##?\s*基本面分析|##?\s*基本面|##?\s*成交量分析|##?\s*Fundamental Analysis)[^\n]*\n([\s\S]*?)(?=##|$)/i)
  if (fundamentalMatch && fundamentalMatch[1].trim()) {
    sections.fundamentalAnalysis = fundamentalMatch[1].trim()
  }

  // 尝试提取投资建议部分
  const recommendationMatch = markdown.match(/(?:##?\s*投资建议|##?\s*建议|##?\s*操作建议|##?\s*Recommendation)[^\n]*\n([\s\S]*?)(?=##|$)/i)
  if (recommendationMatch && recommendationMatch[1].trim()) {
    sections.recommendation = recommendationMatch[1].trim()
  }

  // 尝试提取风险部分
  const risksMatch = markdown.match(/(?:##?\s*风险提示|##?\s*风险|##?\s*风险分析|##?\s*Risks)[^\n]*\n([\s\S]*?)(?=##|$)/i)
  if (risksMatch && risksMatch[1].trim()) {
    sections.risks = risksMatch[1].trim()
  }

  return sections
}

export default AIAnalysisResult
