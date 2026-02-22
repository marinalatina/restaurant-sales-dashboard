'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SalesTarget } from '@/lib/sales-store'

interface TargetSettingsProps {
  targets: SalesTarget[]
  onSave: (targets: SalesTarget[]) => void
  className?: string
}

export function TargetSettings({ targets, onSave, className }: TargetSettingsProps) {
  const [dailyTarget, setDailyTarget] = useState(
    targets.find((t) => t.type === 'daily')?.amount || 30000
  )
  const [weeklyTarget, setWeeklyTarget] = useState(
    targets.find((t) => t.type === 'weekly')?.amount || 180000
  )
  const [monthlyTarget, setMonthlyTarget] = useState(
    targets.find((t) => t.type === 'monthly')?.amount || 800000
  )

  const handleSave = () => {
    onSave([
      { type: 'daily', amount: dailyTarget },
      { type: 'weekly', amount: weeklyTarget },
      { type: 'monthly', amount: monthlyTarget },
    ])
  }

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="size-5" />
          目標設定　GOAL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="daily" className="text-sm opacity-80">
            日次目標
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">¥</span>
            <Input
              id="daily"
              type="number"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(Number(e.target.value))}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weekly" className="text-sm opacity-80">
            週次目標
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">¥</span>
            <Input
              id="weekly"
              type="number"
              value={weeklyTarget}
              onChange={(e) => setWeeklyTarget(Number(e.target.value))}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="monthly" className="text-sm opacity-80">
            月次目標
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">¥</span>
            <Input
              id="monthly"
              type="number"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(Number(e.target.value))}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">
          <Save className="size-4 mr-2" />
          保存
        </Button>
      </CardContent>
    </Card>
  )
}

