'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
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
  Users,
  Settings,
  BarChart3,
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
import {
  parseCustomerCSVContent,
  aggregateByDay,
  aggregateByMonth,
  type CustomerTransaction,
  type CustomerSummary,
} from '@/lib/customer-parser'
import { SalesView } from './sales-view'
import { SettingsView } from './settings-view'
import { mergeSalesAndCustomerData, type MergedAnalysisRecord } from '@/lib/data-merger'
import { cn } from '@/lib/utils'

export function MainDashboard() {
  const [records, setRecords] = useState<SalesRecord[]>([])
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([])
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([])
  const [targets, setTargets] = useState<SalesTarget[]>(defaultTargets)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStorage, setIsLoadingStorage] = useState(true)
  const [activeTab, setActiveTab] = useState('sales')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [customerRecords, setCustomerRecords] = useState<CustomerTransaction[]>([])
  const [customerDaily, setCustomerDaily] = useState<CustomerSummary[]>([])
  const [customerMonthly, setCustomerMonthly] = useState<CustomerSummary[]>([])

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

  // Googleスプレッドシートから客層データを自動取得
  useEffect(() => {
    async function fetchCustomerData() {
      try {
        const res = await fetch('/api/customer-data')
        if (!res.ok) throw new Error('Failed to fetch')
        const csvText = await res.text()
        const records = parseCustomerCSVContent(csvText)

        if (records.length > 0) {
          setCustomerRecords(records)
          setCustomerDaily(aggregateByDay(records))
          setCustomerMonthly(aggregateByMonth(records))
          // toast.success('客層データを自動更新しました') // Show subtle indicator instead of toast on load?
        }
      } catch (e) {
        console.error('Failed to auto-fetch customer data:', e)
        // Silent fail or subtle notification
      }
    }
    fetchCustomerData()
  }, [])

  // 突合データの算出
  const mergedRecords = useMemo(() => {
    if (records.length === 0) return []
    return mergeSalesAndCustomerData(records, customerRecords)
  }, [records, customerRecords])

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

      <div className="flex h-screen">
        {/* Left Menu Bar */}
        <nav className="hidden md:flex flex-col w-16 border-r border-border bg-card h-full">
          <button
            onClick={() => setActiveTab('sales')}
            className={cn(
              'flex flex-col items-center justify-center h-16 border-b border-border transition-colors',
              activeTab === 'sales' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
            )}
            title="売上"
          >
            <BarChart3 className="size-5" />
          </button>
          <button
            onClick={() => setActiveTab('cashflow')}
            className={cn(
              'flex flex-col items-center justify-center h-16 border-b border-border transition-colors',
              activeTab === 'cashflow' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
            )}
            title="キャッシュフロー"
          >
            <Wallet className="size-5" />
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              'flex flex-col items-center justify-center h-16 border-b border-border transition-colors',
              activeTab === 'settings' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'
            )}
            title="設定"
          >
            <Settings className="size-5" />
          </button>
        </nav>


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
          ) : activeTab === 'settings' ? (
            <SettingsView
              targets={targets}
              onTargetSave={handleTargetSave}
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
            />
          ) : !hasData ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <LayoutDashboard className="size-16 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                データがありません
              </h2>
              <p className="text-muted-foreground max-w-md">
                「設定」メニューから売上データ（CSV）をアップロードして、分析を開始しましょう。
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'sales' && (
                <SalesView
                  dailySummaries={dailySummaries}
                  weeklySummaries={weeklySummaries}
                  monthlySummaries={monthlySummaries}
                  targets={targets}
                  customerDaily={customerDaily}
                  customerMonthly={customerMonthly}
                  mergedRecords={mergedRecords}
                  hasData={hasData}
                />
              )}

              {activeTab === 'cashflow' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">キャッシュフロー</h2>
                    <p className="text-muted-foreground">
                      日別の売上とキャッシュフローの推移
                    </p>
                  </div>
                  <CashFlowTable dailySummaries={dailySummaries} />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
