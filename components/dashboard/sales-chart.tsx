'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DailySummary, WeeklySummary } from '@/lib/csv-parser'
import { formatShortDate } from '@/lib/csv-parser'

// Chart colors - using computed values that work with Recharts
const CHART_COLORS = {
  primary: '#6366f1', // indigo-500
  secondary: '#22c55e', // green-500
  tertiary: '#f59e0b', // amber-500
  quaternary: '#ec4899', // pink-500
  muted: '#64748b', // slate-500
}

interface SalesChartProps {
  data: DailySummary[]
  target?: number
}

export function DailySalesChart({ data, target }: SalesChartProps) {
  const chartData = data.map((d) => ({
    date: formatShortDate(d.dateObj),
    sales: d.totalSales,
    target: target || 30000,
  }))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          日次売上推移
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.primary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
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
                formatter={(value: number) => [
                  `¥${value.toLocaleString()}`,
                  '売上',
                ]}
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke={CHART_COLORS.muted}
                strokeDasharray="5 5"
                fill="none"
                name="目標"
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke={CHART_COLORS.primary}
                fill="url(#salesGradient)"
                strokeWidth={2}
                name="売上"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface PaymentChartProps {
  data: DailySummary[] | WeeklySummary[]
  type: 'daily' | 'weekly'
}

export function PaymentMethodChart({ data, type }: PaymentChartProps) {
  const chartData =
    type === 'daily'
      ? (data as DailySummary[]).map((d) => ({
          date: formatShortDate(d.dateObj),
          cash: d.cashSales,
          credit: d.creditSales,
          qrPay: d.qrPaySales,
        }))
      : (data as WeeklySummary[]).map((d) => ({
          date: d.weekStart.slice(5),
          cash: d.paymentBreakdown.cash,
          credit: d.paymentBreakdown.credit,
          qrPay: d.paymentBreakdown.qrPay,
        }))

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          支払方法別売上
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
                formatter={(value: number) => [`¥${value.toLocaleString()}`]}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af' }}
                formatter={(value) => (
                  <span style={{ color: '#9ca3af' }}>{value}</span>
                )}
              />
              <Bar
                dataKey="cash"
                name="現金"
                fill={CHART_COLORS.secondary}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="credit"
                name="クレジット"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="qrPay"
                name="QR決済"
                fill={CHART_COLORS.tertiary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

interface PaymentPieChartProps {
  cashTotal: number
  creditTotal: number
  qrPayTotal: number
}

export function PaymentPieChart({
  cashTotal,
  creditTotal,
  qrPayTotal,
}: PaymentPieChartProps) {
  const total = cashTotal + creditTotal + qrPayTotal
  const data = [
    { name: '現金', value: cashTotal, percentage: ((cashTotal / total) * 100).toFixed(1) },
    { name: 'クレジット', value: creditTotal, percentage: ((creditTotal / total) * 100).toFixed(1) },
    { name: 'QR決済', value: qrPayTotal, percentage: ((qrPayTotal / total) * 100).toFixed(1) },
  ]

  const COLORS = [CHART_COLORS.secondary, CHART_COLORS.primary, CHART_COLORS.tertiary]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          支払方法構成比
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb',
                }}
                formatter={(value: number) => [`¥${value.toLocaleString()}`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name}: {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
