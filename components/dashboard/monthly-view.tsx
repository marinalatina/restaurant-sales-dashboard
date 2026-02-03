'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { CalendarDays, TrendingUp } from 'lucide-react'
import {
  formatCurrency,
  type DailySummary,
  type MonthlySummary,
} from '@/lib/csv-parser'
import { calculateAchievementRate } from '@/lib/sales-store'
import { KPICard } from './kpi-card'
import { PaymentPieChart } from './sales-chart'
import { cn } from '@/lib/utils'

// Chart colors
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#22c55e',
  tertiary: '#f59e0b',
}

interface MonthlyViewProps {
  monthlySummaries: MonthlySummary[]
  dailySummaries: DailySummary[]
  monthlyTarget: number
}

export function MonthlyView({
  monthlySummaries,
  dailySummaries,
  monthlyTarget,
}: MonthlyViewProps) {
  // Get the most recent month
  const currentMonth = monthlySummaries[monthlySummaries.length - 1]
  const previousMonth =
    monthlySummaries.length > 1
      ? monthlySummaries[monthlySummaries.length - 2]
      : null

  if (!currentMonth) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        月別データがありません
      </div>
    )
  }

  const achievementRate = calculateAchievementRate(
    currentMonth.totalSales,
    monthlyTarget
  )
  const monthOverMonthChange = previousMonth
    ? Math.round(
      ((currentMonth.totalSales - previousMonth.totalSales) /
        previousMonth.totalSales) *
      100
    )
    : 0

  const taxExcludedSales = currentMonth.totalSubtotal

  // Weekly data for chart
  const weeklyChartData = currentMonth.weeklyData.map((week, index) => ({
    name: `第${index + 1}週`,
    sales: week.totalSales,
    customers: week.customerCount,
  }))

  // Daily trend data
  const dailyTrendData = dailySummaries
    .filter((d) => {
      const month = d.dateObj.getMonth() + 1
      const year = d.dateObj.getFullYear()
      return currentMonth.month === `${year}年${month}月`
    })
    .map((d) => ({
      date: `${d.dateObj.getDate()}日`,
      sales: d.totalSales,
      average: currentMonth.dailyAverage,
    }))

  return (
    <div className="space-y-6">
      {/* Month Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            月別レポート
          </h2>
          <p className="text-sm text-muted-foreground">{currentMonth.month}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-sm',
            achievementRate >= 100 && 'border-success/30 bg-success/10 text-success',
            achievementRate >= 80 &&
            achievementRate < 100 &&
            'border-warning/30 bg-warning/10 text-warning',
            achievementRate < 80 &&
            'border-destructive/30 bg-destructive/10 text-destructive'
          )}
        >
          目標達成率: {achievementRate}%
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="月間売上"
          value={
            <div className="flex flex-col items-baseline gap-1">
              <span className="text-2xl font-bold">
                税抜{formatCurrency(taxExcludedSales)}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                (税込{formatCurrency(currentMonth.totalSales)})
              </span>
            </div>
          }
          trend={
            previousMonth
              ? {
                value: monthOverMonthChange,
                direction:
                  monthOverMonthChange > 0
                    ? 'up'
                    : monthOverMonthChange < 0
                      ? 'down'
                      : 'flat',
              }
              : undefined
          }
        />
        <KPICard
          title="目標達成率"
          value={
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {achievementRate}%
              </span>
              <div className="text-sm text-muted-foreground mt-1">
                目標: {formatCurrency(monthlyTarget)}
              </div>
            </div>
          }
        />
        <KPICard
          title="来客数"
          value={`${currentMonth.customerCount}人`}
          subtitle={`日平均 ${Math.round(currentMonth.customerCount / 30)}人`}
        />
        <KPICard
          title="客単価"
          value={formatCurrency(currentMonth.averagePerCustomer)}
          subtitle="1人あたりの平均支払額"
        />
      </div>

      {/* Progress to Target */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="size-5" />
            目標進捗
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">月別目標</span>
              <span className="text-foreground font-medium">
                {formatCurrency(currentMonth.totalSales)} /{' '}
                {formatCurrency(monthlyTarget)}
              </span>
            </div>
            <Progress
              value={Math.min(achievementRate, 100)}
              className="h-3"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            {achievementRate < 100 && (
              <p className="text-sm text-muted-foreground">
                目標まであと{' '}
                <span className="text-foreground font-medium">
                  {formatCurrency(monthlyTarget - currentMonth.totalSales)}
                </span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="size-5" />
              週別売上
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f9fafb',
                    }}
                    formatter={(value: number) => [
                      `¥${value.toLocaleString()}`,
                      '売上',
                    ]}
                  />
                  <Bar
                    dataKey="sales"
                    fill={CHART_COLORS.primary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <PaymentPieChart
          cashTotal={currentMonth.paymentBreakdown.cash}
          creditTotal={currentMonth.paymentBreakdown.credit}
          qrPayTotal={currentMonth.paymentBreakdown.qrPay}
        />
      </div>

      {/* Daily Trend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            日別推移
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb',
                  }}
                  formatter={(value: number, name: string) => [
                    `¥${value.toLocaleString()}`,
                    name === 'sales' ? '売上' : '日平均',
                  ]}
                />
                {/* <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#64748b"
                  strokeDasharray="5 5"
                  dot={false}
                  name="日平均"
                  
                /> */}
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.primary, r: 3 }}
                  name="売上"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
