'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DailyView } from './daily-view'
import { MonthlyView } from './monthly-view'
import { CustomerAnalysisView } from './customer-analysis-view'
import { Calendar, CalendarDays, Users } from 'lucide-react'
import { type DailySummary, type WeeklySummary, type MonthlySummary } from '@/lib/csv-parser'
import { type SalesTarget } from '@/lib/sales-store'
import { type CustomerSummary } from '@/lib/customer-parser'

interface SalesViewProps {
    dailySummaries: DailySummary[]
    weeklySummaries: WeeklySummary[]
    monthlySummaries: MonthlySummary[]
    targets: SalesTarget[]
    customerDaily: CustomerSummary[]
    customerMonthly: CustomerSummary[]
    hasData: boolean
}

export function SalesView({
    dailySummaries,
    weeklySummaries,
    monthlySummaries,
    targets,
    customerDaily,
    customerMonthly,
    hasData
}: SalesViewProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">売上分析</h2>
                <p className="text-muted-foreground">
                    日次・月次レポートと客層分析を確認できます
                </p>
            </div>

            <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily" className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        日次レポート
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        月次レポート
                    </TabsTrigger>
                    <TabsTrigger value="customer" className="flex items-center gap-2">
                        <Users className="size-4" />
                        客層分析
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="daily" className="mt-6">
                    {hasData ? (
                        <DailyView
                            dailySummaries={dailySummaries}
                            dailyTarget={targets.find(t => t.period === 'daily')?.amount || 0}
                        />
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
                                <p className="text-muted-foreground">
                                    データがありません。設定からCSVファイルをアップロードしてください。
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="monthly" className="mt-6">
                    {hasData ? (
                        <MonthlyView
                            monthlySummaries={monthlySummaries}
                            dailySummaries={dailySummaries}
                            monthlyTarget={targets.find(t => t.period === 'monthly')?.amount || 0}
                        />
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
                                <p className="text-muted-foreground">
                                    データがありません。設定からCSVファイルをアップロードしてください。
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="customer" className="mt-6">
                    <CustomerAnalysisView
                        dailyData={customerDaily}
                        monthlyData={customerMonthly}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
