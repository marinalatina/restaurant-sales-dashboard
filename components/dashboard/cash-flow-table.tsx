'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate, type DailySummary } from '@/lib/csv-parser'
import { cn } from '@/lib/utils'

interface CashFlowTableProps {
  dailySummaries: DailySummary[]
  initialBalance?: number
}

export function CashFlowTable({
  dailySummaries,
  initialBalance = 0,
}: CashFlowTableProps) {
  let runningBalance = initialBalance

  const cashFlowData = dailySummaries.map((day) => {
    runningBalance += day.totalSales
    return {
      date: day.date,
      dateObj: day.dateObj,
      income: day.totalSales,
      expense: 0, // Will be added when expense data is available
      balance: runningBalance,
      transactionCount: day.transactionCount,
      customerCount: day.customerCount,
    }
  })

  const totalIncome = dailySummaries.reduce((sum, d) => sum + d.totalSales, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Wallet className="size-5" />
            キャッシュフロー
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-success" />
              <span className="text-sm text-muted-foreground">
                収入: {formatCurrency(totalIncome)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-border">
                <TableHead className="text-muted-foreground">日付</TableHead>
                <TableHead className="text-muted-foreground text-right">
                  売上
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  取引数
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  来客数
                </TableHead>
                <TableHead className="text-muted-foreground text-right">
                  累計残高
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlowData.map((row) => (
                <TableRow key={row.date} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    {formatDate(row.dateObj)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-mono',
                        'border-success/30 bg-success/10 text-success'
                      )}
                    >
                      <TrendingUp className="size-3 mr-1" />
                      {formatCurrency(row.income)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.transactionCount}件
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.customerCount}人
                  </TableCell>
                  <TableCell className="text-right font-mono text-foreground">
                    {formatCurrency(row.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
