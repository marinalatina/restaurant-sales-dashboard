'use client'

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Wallet,
  Menu,
  X,
} from 'lucide-react'
import {
  parseCSVFile,
  generateDailySummaries,
  generateWeeklySummaries,
  generateMonthlySummaries,
  type SalesRecord,
  type DailySummary,
  type WeeklySummary,
  type MonthlySummary,
} from '@/lib/csv-parser'
import { defaultTargets, type SalesTarget } from '@/lib/sales-store'
import { saveSalesRecords, fetchSalesRecords, saveSalesTargets, fetchSalesTargets } from '@/lib/supabase/sales'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { CSVUploader } from './csv-uploader'
import { DailyView } from './daily-view'
import { MonthlyView } from './monthly-view'
import { CashFlowTable } from './cash-flow-table'
import { TargetSettings } from './target-settings'
import { cn } from '@/lib/utils'

export function MainDashboard() {
  const [records, setRecords] = useState<SalesRecord[]>([])
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([])
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])
  const [targets, setTargets] = useState<SalesTarget[]>(defaultTargets)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStorage, setIsLoadingStorage] = useState(true)
  const [activeTab, setActiveTab] = useState('daily')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Supabase から初期データを読み込み
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsLoadingStorage(false)
      return
    }
    let cancelled = false
    async function load() {
      const [recordsRes, targetsRes] = await Promise.all([
        fetchSalesRecords(),
        fetchSalesTargets(),
      ])
      if (cancelled) return
      if (recordsRes.error) toast.error(recordsRes.error)
      if (targetsRes.error) toast.error(targetsRes.error)
      if (recordsRes.records.length > 0) {
        setRecords(recordsRes.records)
        const daily = generateDailySummaries(recordsRes.records)
        setDailySummaries(daily)
        const weekly = generateWeeklySummaries(daily)
        setWeeklySummaries(weekly)
        setMonthlySummaries(generateMonthlySummaries(daily, weekly))
        console.log('[Dashboard Date] 0. Supabase から読み込み', {
          レコード数: recordsRes.records.length,
          日次日数: daily.length,
          週数: weekly.length,
        })
      }
      if (targetsRes.targets.length > 0) setTargets(targetsRes.targets)
      setIsLoadingStorage(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true)
    try {
      const parsedRecords = await parseCSVFile(file)
      if (isSupabaseConfigured()) {
        const { success, error } = await saveSalesRecords(parsedRecords)
        if (!success) {
          toast.error(error ?? '保存に失敗しました')
          setIsLoading(false)
          return
        }
      }
      setRecords(parsedRecords)
      const daily = generateDailySummaries(parsedRecords)
      const weekly = generateWeeklySummaries(daily)
      setDailySummaries(daily)
      setWeeklySummaries(weekly)
      setMonthlySummaries(generateMonthlySummaries(daily, weekly))
      console.log('[Dashboard Date] 0. CSVアップロード後 データ設定', {
        レコード数: parsedRecords.length,
        日次日数: daily.length,
        週数: weekly.length,
      })
      if (isSupabaseConfigured()) toast.success('Supabaseに保存しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleTargetSave = useCallback(async (newTargets: SalesTarget[]) => {
    if (isSupabaseConfigured()) {
      const { success, error } = await saveSalesTargets(newTargets)
      if (!success) {
        toast.error(error ?? '目標の保存に失敗しました')
        return
      }
      toast.success('目標を保存しました')
    }
    setTargets(newTargets)
  }, [])

  const dailyTarget = targets.find((t) => t.type === 'daily')?.amount || 30000
  const monthlyTarget =
    targets.find((t) => t.type === 'monthly')?.amount || 800000

  const hasData = records.length > 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="size-5 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">
                売上管理ダッシュボード
              </h1>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {hasData && `${records.length}件のデータを読み込み済み`}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card pt-14 transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:pt-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full p-4 space-y-4">
            <CSVUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
            <TargetSettings targets={targets} onSave={handleTargetSave} />
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {isLoadingStorage ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="size-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-muted-foreground">データを読み込み中...</p>
            </div>
          ) : !hasData ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <LayoutDashboard className="size-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                データがありません
              </h2>
              <p className="text-muted-foreground max-w-md">
                左側のパネルからCSVファイルをアップロードして、売上データを分析しましょう。
              </p>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="bg-muted">
                <TabsTrigger value="daily" className="gap-2">
                  <Calendar className="size-4" />
                  <span className="hidden sm:inline">日別</span>
                </TabsTrigger>
                <TabsTrigger value="monthly" className="gap-2">
                  <CalendarDays className="size-4" />
                  <span className="hidden sm:inline">月別</span>
                </TabsTrigger>
                <TabsTrigger value="cashflow" className="gap-2">
                  <Wallet className="size-4" />
                  <span className="hidden sm:inline">キャッシュフロー</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily">
                <DailyView
                  dailySummaries={dailySummaries}
                  dailyTarget={dailyTarget}
                />
              </TabsContent>

              <TabsContent value="monthly">
                <MonthlyView
                  monthlySummaries={monthlySummaries}
                  dailySummaries={dailySummaries}
                  monthlyTarget={monthlyTarget}
                />
              </TabsContent>

              <TabsContent value="cashflow">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      キャッシュフロー
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      日別の売上とキャッシュフローの推移
                    </p>
                  </div>
                  <CashFlowTable dailySummaries={dailySummaries} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  )
}
