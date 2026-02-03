'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, CreditCard, TrendingUp } from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  type DailySummary,
} from '@/lib/csv-parser'
import { calculateAchievementRate } from '@/lib/sales-store'
import { KPICard } from './kpi-card'
import { DailySalesChart, PaymentMethodChart } from './sales-chart'
import { cn } from '@/lib/utils'

interface DailyViewProps {
  dailySummaries: DailySummary[]
  dailyTarget: number
}

export function DailyView({
  dailySummaries,
  dailyTarget,
}: DailyViewProps) {
  if (dailySummaries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        日別データがありません
      </div>
    )
  }

  const firstDate = dailySummaries[0].date
  const lastDate = dailySummaries[dailySummaries.length - 1].date
  const totalSales = dailySummaries.reduce((sum, d) => sum + d.totalSales, 0)
  const totalTransactions = dailySummaries.reduce(
    (sum, d) => sum + d.transactionCount,
    0
  )
  const totalCustomers = dailySummaries.reduce(
    (sum, d) => sum + d.customerCount,
    0
  )
  const totalTax = dailySummaries.reduce((sum, d) => sum + d.totalTax, 0)
  const totalSubtotal = dailySummaries.reduce((sum, d) => sum + d.totalSubtotal, 0)
  const taxExcludedSales = totalSubtotal
  const dailyAverageSales =
    dailySummaries.length > 0
      ? Math.round(totalSales / dailySummaries.length)
      : 0
  const overallAchievementRate = calculateAchievementRate(
    dailyAverageSales,
    dailyTarget
  )

  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            日別レポート
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(firstDate)} - {formatDate(lastDate)}（
            {dailySummaries.length}日分）
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-sm',
            overallAchievementRate >= 100 &&
            'border-success/30 bg-success/10 text-success',
            overallAchievementRate >= 80 &&
            overallAchievementRate < 100 &&
            'border-warning/30 bg-warning/10 text-warning',
            overallAchievementRate < 80 &&
            'border-destructive/30 bg-destructive/10 text-destructive'
          )}
        >
          日平均達成率: {overallAchievementRate}%
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="合計売上"
          value={
            <div className="flex flex-col items-baseline gap-1">
              <span className="text-2xl font-bold">
                税抜{formatCurrency(taxExcludedSales)}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                (税込{formatCurrency(totalSales)})
              </span>
            </div>
          }
        />
        <KPICard
          title="目標達成率"
          value={
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {overallAchievementRate}%
              </span>
              <div className="text-sm text-muted-foreground mt-1">
                日平均 {formatCurrency(dailyAverageSales)}
              </div>
              <div className="text-sm text-muted-foreground">
                目標: {formatCurrency(dailyTarget)}
              </div>
            </div>
          }
        />
        <KPICard
          title="来客数"
          value={`${totalCustomers}人`}
          subtitle={`日平均 ${Math.round(totalCustomers / dailySummaries.length)}人`}
        />
        <KPICard
          title="客単価"
          value={
            totalCustomers > 0
              ? formatCurrency(Math.round(totalSales / totalCustomers))
              : '¥0'
          }
          subtitle="1人あたりの平均支払額"
        />
      </div>

      {/* Progress to Daily Target */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="size-5" />
            日別目標進捗（日平均）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">日別目標</span>
              <span className="text-foreground font-medium">
                {formatCurrency(dailyAverageSales)} /{' '}
                {formatCurrency(dailyTarget)}
              </span>
            </div>
            <Progress
              value={Math.min(overallAchievementRate, 100)}
              className="h-3"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailySalesChart data={dailySummaries} target={dailyTarget} />
        <PaymentMethodChart data={dailySummaries} type="daily" />
      </div>

      {/* Daily Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="size-5" />
            日別売上
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {dailySummaries.map((day) => {
              const dayOfWeek = dayNames[day.dateObj.getDay()]
              const dailyRate = calculateAchievementRate(
                day.totalSales,
                dailyTarget
              )

              return (
                <div
                  key={day.date}
                  className="p-4 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(day.date)}（{dayOfWeek}）
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        dailyRate >= 100 &&
                        'border-success/30 text-success',
                        dailyRate < 100 &&
                        'border-muted-foreground/30 text-muted-foreground'
                      )}
                    >
                      {dailyRate}%
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {formatCurrency(day.totalSales)}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Users className="size-3" />
                    <span>{day.customerCount}人</span>
                    <CreditCard className="size-3 ml-2" />
                    <span>{day.transactionCount}件</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div >
  )
}
