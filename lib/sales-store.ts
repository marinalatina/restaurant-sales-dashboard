// Simple in-memory store for sales data and targets
import type {
  SalesRecord,
  DailySummary,
  WeeklySummary,
  MonthlySummary,
} from './csv-parser'

export interface SalesTarget {
  type: 'daily' | 'weekly' | 'monthly'
  amount: number
  period?: string // e.g., "2025-12" for monthly, week start date for weekly
}

export interface CashFlowEntry {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
}

export interface SalesData {
  records: SalesRecord[]
  dailySummaries: DailySummary[]
  weeklySummaries: WeeklySummary[]
  monthlySummaries: MonthlySummary[]
  targets: SalesTarget[]
  cashFlow: CashFlowEntry[]
}

// Default targets (can be customized)
export const defaultTargets: SalesTarget[] = [
  { type: 'daily', amount: 30000 },
  { type: 'weekly', amount: 180000 },
  { type: 'monthly', amount: 800000 },
]

// Calculate achievement rate
export function calculateAchievementRate(
  actual: number,
  target: number
): number {
  if (target === 0) return 0
  return Math.round((actual / target) * 100)
}

// Get status based on achievement rate
export function getAchievementStatus(
  rate: number
): 'success' | 'warning' | 'danger' {
  if (rate >= 100) return 'success'
  if (rate >= 80) return 'warning'
  return 'danger'
}

// Calculate period comparison
export function calculatePeriodComparison(
  current: number,
  previous: number
): { difference: number; percentage: number; trend: 'up' | 'down' | 'flat' } {
  const difference = current - previous
  const percentage =
    previous !== 0 ? Math.round((difference / previous) * 100) : 0

  return {
    difference,
    percentage,
    trend: difference > 0 ? 'up' : difference < 0 ? 'down' : 'flat',
  }
}

// Generate cash flow entries from sales data
export function generateCashFlowFromSales(
  dailySummaries: DailySummary[]
): CashFlowEntry[] {
  return dailySummaries.map((day) => ({
    date: day.date,
    description: '店内売上',
    amount: day.totalSales,
    type: 'income' as const,
    category: '売上',
  }))
}
