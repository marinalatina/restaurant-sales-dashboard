'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | React.ReactNode
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'flat'
  }
  target?: {
    value: string
    rate: number
  }
  className?: string
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  target,
  className,
}: KPICardProps) {
  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        <div className="flex items-center gap-4 mt-2">
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                trend.direction === 'up' && 'text-success',
                trend.direction === 'down' && 'text-destructive',
                trend.direction === 'flat' && 'text-muted-foreground'
              )}
            >
              {trend.direction === 'up' && <TrendingUp className="size-3" />}
              {trend.direction === 'down' && (
                <TrendingDown className="size-3" />
              )}
              {trend.direction === 'flat' && <Minus className="size-3" />}
              <span>
                {trend.direction === 'up' ? '+' : ''}
                {trend.value}%
              </span>
            </div>
          )}
          {target && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">
                目標: {target.value}
              </span>
              <span
                className={cn(
                  'font-medium',
                  target.rate >= 100 && 'text-success',
                  target.rate >= 80 && target.rate < 100 && 'text-warning',
                  target.rate < 80 && 'text-destructive'
                )}
              >
                {target.rate}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
