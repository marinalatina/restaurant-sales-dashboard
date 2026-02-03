// CSV Parser for bregister (レジ) payment history
// Handles Shift-JIS encoded CSV files

export interface SalesRecord {
  orderId: string
  table: string
  staff: string
  paymentMethod: string
  dateTime: Date
  dateString: string
  type: string
  subtotal: number
  discount: number
  couponDiscount: number
  tax: number
  tax10: number
  tax8: number
  receivedAmount: number
  change: number
  paymentAmount: number
  customerCount: number
  menuItems: { name: string; quantity: number }[]
}

export interface DailySummary {
  date: string
  dateObj: Date
  totalSales: number
  transactionCount: number
  customerCount: number
  averagePerCustomer: number
  cashSales: number
  creditSales: number
  qrPaySales: number
  tax10Sales: number
  tax8Sales: number
  totalTax: number
  totalSubtotal: number
}

export interface WeeklySummary {
  weekStart: string
  weekEnd: string
  totalSales: number
  transactionCount: number
  customerCount: number
  averagePerCustomer: number
  dailyAverage: number
  paymentBreakdown: {
    cash: number
    credit: number
    qrPay: number
  }
}

export interface MonthlySummary {
  month: string
  year: number
  totalSales: number
  transactionCount: number
  customerCount: number
  averagePerCustomer: number
  dailyAverage: number
  paymentBreakdown: {
    cash: number
    credit: number
    qrPay: number
  }
  weeklyData: WeeklySummary[]
  totalTax: number
  totalSubtotal: number
}

// Decode Shift-JIS to UTF-8
async function decodeShiftJIS(buffer: ArrayBuffer): Promise<string> {
  const decoder = new TextDecoder('shift-jis')
  return decoder.decode(buffer)
}

// Parse CSV content
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

// Parse date from format like "2025/12/01(日) 11:24"
function parseJapaneseDate(dateStr: string): Date {
  const match = dateStr.match(/(\d{4})\/(\d{2})\/(\d{2}).*?(\d{2}):(\d{2})/)
  if (!match) return new Date()

  const [, year, month, day, hour, minute] = match
  return new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day),
    Number.parseInt(hour),
    Number.parseInt(minute)
  )
}

/**
 * CSVの日付文字列から YYYY-MM-DD を取得（タイムゾーンに依存しない）
 * "2026/01/09(木) 12:22" → "2026-01-09"
 */
export function getDateKeyFromDateString(dateString: string): string {
  const match = dateString.match(/(\d{4})\/(\d{2})\/(\d{2})/)
  if (!match) return ''
  const [, y, m, d] = match
  return `${y}-${m}-${d}`
}

/**
 * YYYY-MM-DD からその日の正午の Date を生成（getDay() がタイムゾーンでずれないように）
 */
function getDateObjFromDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return new Date()
  return new Date(y, m - 1, d, 12, 0, 0)
}

/** Date をローカル日付の YYYY-MM-DD に（toISOString だと UTC でずれるため） */
function formatDateKeyLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Categorize payment method
function categorizePayment(method: string): 'cash' | 'credit' | 'qrPay' {
  if (method.includes('現金')) return 'cash'
  if (
    method.includes('Visa') ||
    method.includes('Master') ||
    method.includes('JCB') ||
    method.includes('Amex')
  ) {
    return 'credit'
  }
  // PayPay, d払い, 楽天ペイ, auPAY etc.
  return 'qrPay'
}

export async function parseCSVFile(file: File): Promise<SalesRecord[]> {
  const buffer = await file.arrayBuffer()
  const content = await decodeShiftJIS(buffer)
  const lines = content.split('\n').filter((line) => line.trim())

  // Skip header row
  const dataLines = lines.slice(1)
  const records: SalesRecord[] = []

  for (const line of dataLines) {
    const fields = parseCSVLine(line)
    if (fields.length < 16) continue

    const [
      orderId,
      table,
      staff,
      paymentMethod,
      dateTimeStr,
      type,
      subtotalStr,
      discountStr,
      couponStr,
      taxStr,
      tax10Str,
      tax8Str,
      receivedStr,
      changeStr,
      paymentStr,
      countStr,
      ...menuData
    ] = fields

    // Parse menu items (pairs of name and quantity)
    const menuItems: { name: string; quantity: number }[] = []
    for (let i = 0; i < menuData.length - 1; i += 2) {
      if (menuData[i] && menuData[i + 1]) {
        menuItems.push({
          name: menuData[i],
          quantity: Number.parseInt(menuData[i + 1]) || 1,
        })
      }
    }

    // 日付が空・不正な行はスキップ（new Date() で「今日」になり2月の週ができるのを防ぐ）
    const dateKeyFromCsv = getDateKeyFromDateString(dateTimeStr)
    if (!dateTimeStr?.trim() || !dateKeyFromCsv) continue

    const dateTime = parseJapaneseDate(dateTimeStr)

    records.push({
      orderId,
      table,
      staff,
      paymentMethod,
      dateTime,
      dateString: dateTimeStr,
      type,
      subtotal: Number.parseInt(subtotalStr) || 0,
      discount: Number.parseInt(discountStr) || 0,
      couponDiscount: Number.parseInt(couponStr) || 0,
      tax: Number.parseInt(taxStr) || 0,
      tax10: Number.parseInt(tax10Str) || 0,
      tax8: Number.parseInt(tax8Str) || 0,
      receivedAmount: Number.parseInt(receivedStr) || 0,
      change: Number.parseInt(changeStr) || 0,
      paymentAmount: Number.parseInt(paymentStr) || 0,
      customerCount: Number.parseInt(countStr) || 1,
      menuItems,
    })
  }

  // [Dashboard Date] デバッグ: CSVパース直後の日付
  if (records.length > 0) {
    const sample = [
      records[0],
      records.length > 1 ? records[1] : null,
      records.length > 2 ? records[2] : null,
      records.length > 1 ? records[records.length - 1] : null,
    ].filter(Boolean) as SalesRecord[]
    console.log('[Dashboard Date] 1. parseCSVFile 直後', {
      総件数: records.length,
      サンプル: sample.map((r) => ({
        dateString: r.dateString,
        dateKey: getDateKeyFromDateString(r.dateString),
        dateTime_toISO: r.dateTime.toISOString(),
        dateTime_local: r.dateTime.toLocaleString('ja-JP'),
      })),
    })
  }

  return records
}

// Generate daily summaries（CSVの日付文字列でグループ化し、タイムゾーンによるずれを防ぐ）
export function generateDailySummaries(records: SalesRecord[]): DailySummary[] {
  const dailyMap = new Map<string, SalesRecord[]>()

  for (const record of records) {
    const dateKey =
      getDateKeyFromDateString(record.dateString) ||
      record.dateTime.toISOString().split('T')[0]
    if (!dateKey) continue
    if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, [])
    dailyMap.get(dateKey)!.push(record)
  }

  // [Dashboard Date] デバッグ: 日次集計の日付キー
  const dateKeys = Array.from(dailyMap.keys()).sort()
  console.log('[Dashboard Date] 2. generateDailySummaries', {
    日付ごと件数: Object.fromEntries(
      dateKeys.map((d) => [d, dailyMap.get(d)!.length])
    ),
    日付一覧: dateKeys,
    日数: dateKeys.length,
  })

  const summaries: DailySummary[] = []

  for (const [date, dayRecords] of dailyMap) {
    const totalSales = dayRecords.reduce((sum, r) => sum + r.paymentAmount, 0)
    const customerCount = dayRecords.reduce((sum, r) => sum + r.customerCount, 0)
    const cashSales = dayRecords
      .filter((r) => categorizePayment(r.paymentMethod) === 'cash')
      .reduce((sum, r) => sum + r.paymentAmount, 0)
    const creditSales = dayRecords
      .filter((r) => categorizePayment(r.paymentMethod) === 'credit')
      .reduce((sum, r) => sum + r.paymentAmount, 0)
    const qrPaySales = dayRecords
      .filter((r) => categorizePayment(r.paymentMethod) === 'qrPay')
      .reduce((sum, r) => sum + r.paymentAmount, 0)
    const tax10Sales = dayRecords.reduce((sum, r) => sum + r.tax10, 0)
    const tax8Sales = dayRecords.reduce((sum, r) => sum + r.tax8, 0)

    summaries.push({
      date,
      dateObj: getDateObjFromDateKey(date),
      totalSales,
      transactionCount: dayRecords.length,
      customerCount,
      averagePerCustomer: customerCount > 0 ? Math.round(totalSales / customerCount) : 0,
      cashSales,
      creditSales,
      qrPaySales,
      tax10Sales,
      tax8Sales,
      totalTax: tax10Sales + tax8Sales,
      totalSubtotal: dayRecords.reduce((sum, r) => sum + r.subtotal, 0),
    })
  }

  const sorted = summaries.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
  console.log('[Dashboard Date] 2. generateDailySummaries 結果', {
    日次サマリー日付: sorted.map((s) => s.date),
  })
  return sorted
}

// Generate weekly summaries
export function generateWeeklySummaries(
  dailySummaries: DailySummary[]
): WeeklySummary[] {
  const weeklyMap = new Map<string, DailySummary[]>()

  for (const daily of dailySummaries) {
    const date = daily.dateObj
    const dayOfWeek = date.getDay()
    const weekStartDate = new Date(date)
    weekStartDate.setDate(date.getDate() - dayOfWeek)
    const weekKey = formatDateKeyLocal(weekStartDate)

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, [])
    }
    weeklyMap.get(weekKey)!.push(daily)
  }

  const summaries: WeeklySummary[] = []

  for (const [weekStartStr, weekDays] of weeklyMap) {
    const totalSales = weekDays.reduce((sum, d) => sum + d.totalSales, 0)
    const transactionCount = weekDays.reduce(
      (sum, d) => sum + d.transactionCount,
      0
    )
    const customerCount = weekDays.reduce((sum, d) => sum + d.customerCount, 0)
    const cashSales = weekDays.reduce((sum, d) => sum + d.cashSales, 0)
    const creditSales = weekDays.reduce((sum, d) => sum + d.creditSales, 0)
    const qrPaySales = weekDays.reduce((sum, d) => sum + d.qrPaySales, 0)

    const weekStartDate = getDateObjFromDateKey(weekStartStr)
    const weekEndDate = new Date(weekStartDate)
    weekEndDate.setDate(weekEndDate.getDate() + 6)

    summaries.push({
      weekStart: weekStartStr,
      weekEnd: formatDateKeyLocal(weekEndDate),
      totalSales,
      transactionCount,
      customerCount,
      averagePerCustomer:
        customerCount > 0 ? Math.round(totalSales / customerCount) : 0,
      dailyAverage:
        weekDays.length > 0 ? Math.round(totalSales / weekDays.length) : 0,
      paymentBreakdown: {
        cash: cashSales,
        credit: creditSales,
        qrPay: qrPaySales,
      },
    })
  }

  const sorted = summaries.sort(
    (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
  )
  // [Dashboard Date] デバッグ: 週次集計の表示期間
  console.log('[Dashboard Date] 3. generateWeeklySummaries', {
    週一覧: sorted.map((w) => ({
      weekStart: w.weekStart,
      weekEnd: w.weekEnd,
      表示: `${w.weekStart} - ${w.weekEnd}`,
      取引件数: w.transactionCount,
    })),
    最後の週: sorted.length > 0 ? sorted[sorted.length - 1] : null,
  })
  return sorted
}

// Generate monthly summaries
export function generateMonthlySummaries(
  dailySummaries: DailySummary[],
  weeklySummaries: WeeklySummary[]
): MonthlySummary[] {
  const monthlyMap = new Map<string, DailySummary[]>()

  for (const daily of dailySummaries) {
    const monthKey = `${daily.dateObj.getFullYear()}-${String(daily.dateObj.getMonth() + 1).padStart(2, '0')}`
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, [])
    }
    monthlyMap.get(monthKey)!.push(daily)
  }

  const summaries: MonthlySummary[] = []

  for (const [monthKey, monthDays] of monthlyMap) {
    const [year, month] = monthKey.split('-').map(Number)
    const totalSales = monthDays.reduce((sum, d) => sum + d.totalSales, 0)
    const transactionCount = monthDays.reduce(
      (sum, d) => sum + d.transactionCount,
      0
    )
    const customerCount = monthDays.reduce((sum, d) => sum + d.customerCount, 0)
    const cashSales = monthDays.reduce((sum, d) => sum + d.cashSales, 0)
    const creditSales = monthDays.reduce((sum, d) => sum + d.creditSales, 0)
    const qrPaySales = monthDays.reduce((sum, d) => sum + d.qrPaySales, 0)

    // Filter weekly summaries for this month
    const monthWeeklies = weeklySummaries.filter((w) => {
      const weekDate = new Date(w.weekStart)
      return weekDate.getFullYear() === year && weekDate.getMonth() + 1 === month
    })

    summaries.push({
      month: `${year}年${month}月`,
      year,
      totalSales,
      transactionCount,
      customerCount,
      averagePerCustomer:
        customerCount > 0 ? Math.round(totalSales / customerCount) : 0,
      dailyAverage:
        monthDays.length > 0 ? Math.round(totalSales / monthDays.length) : 0,
      paymentBreakdown: {
        cash: cashSales,
        credit: creditSales,
        qrPay: qrPaySales,
      },
      weeklyData: monthWeeklies,
      totalTax: monthDays.reduce((sum, d) => sum + d.totalTax, 0),
      totalSubtotal: monthDays.reduce((sum, d) => sum + d.totalSubtotal, 0),
    })
  }

  return summaries.sort((a, b) => {
    const [yearA, monthA] = a.month
      .replace('年', '-')
      .replace('月', '')
      .split('-')
      .map(Number)
    const [yearB, monthB] = b.month
      .replace('年', '-')
      .replace('月', '')
      .split('-')
      .map(Number)
    return yearA !== yearB ? yearA - yearB : monthA - monthB
  })
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}

// Format date
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format short date for charts
export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${d.getMonth() + 1}/${d.getDate()}`
}
