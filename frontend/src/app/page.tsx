"use client"

import React from 'react'
import Link from 'next/link'
import MainLayout from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart2, TrendingUp, LineChart, Activity } from 'lucide-react'

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <section className="py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">数据分析与决策系统</h1>
          <p className="text-xl text-muted-foreground mb-8">
            支持A股、美股、港股以及国内外期货市场的综合分析平台，更多数据分析决策敬请期待
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/stock">
                <TrendingUp className="mr-2 h-5 w-5" />
                开始股票分析
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/futures">
                <LineChart className="mr-2 h-5 w-5" />
                开始期货分析
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2 h-5 w-5" />
                股票分析
              </CardTitle>
              <CardDescription>
                全面分析A股、美股和港股市场
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                通过技术指标、趋势分析和AI辅助分析，为您提供全面的股票市场洞察。支持单只股票深度分析和批量股票筛选。
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/stock">查看详情</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5" />
                期货分析
              </CardTitle>
              <CardDescription>
                分析国内外期货市场
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                提供期货市场的技术分析、持仓量分析和价格趋势预测，帮助您把握期货市场的交易机会。
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/futures">查看详情</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                系统特点
              </CardTitle>
              <CardDescription>
                强大的分析能力和用户友好界面
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 mb-4">
                <li>多市场支持：A股、美股、港股和期货</li>
                <li>技术指标：MA、RSI、MACD等</li>
                <li>AI辅助分析：提供智能分析建议</li>
                <li>批量分析：高效筛选优质标的</li>
                <li>直观界面：数据可视化展示</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-bold mb-6 text-center">使用指南</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 border rounded-lg text-center">
              <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-medium mb-2">选择市场</h3>
              <p className="text-sm text-muted-foreground">
                选择您要分析的市场类型（A股、美股、港股或期货）
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-medium mb-2">输入代码</h3>
              <p className="text-sm text-muted-foreground">
                输入您想要分析的股票或期货代码
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-medium mb-2">获取分析</h3>
              <p className="text-sm text-muted-foreground">
                系统会自动分析并生成详细的分析报告
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="font-medium mb-2">查看建议</h3>
              <p className="text-sm text-muted-foreground">
                根据分析结果和AI建议做出投资决策
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
