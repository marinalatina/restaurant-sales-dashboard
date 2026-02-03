import { supabase, isSupabaseConfigured } from './client'
import type { SalesRecord } from '@/lib/csv-parser'
import type { SalesTarget } from '@/lib/sales-store'

/** DBの1行を SalesRecord に変換 */
function rowToSalesRecord(row: {
  order_id: string
  table_name: string
  staff: string
  payment_method: string
  date_time: string
  date_string: string
  type: string
  subtotal: number
  discount: number
  coupon_discount: number
  tax: number
  tax10: number
  tax8: number
  received_amount: number
  change: number
  payment_amount: number
  customer_count: number
  menu_items: unknown
}): SalesRecord {
  const menuItems = Array.isArray(row.menu_items)
    ? (row.menu_items as { name: string; quantity: number }[])
    : []
  return {
    orderId: row.order_id,
    table: row.table_name,
    staff: row.staff,
    paymentMethod: row.payment_method,
    dateTime: new Date(row.date_time),
    dateString: row.date_string,
    type: row.type,
    subtotal: row.subtotal,
    discount: row.discount,
    couponDiscount: row.coupon_discount,
    tax: row.tax,
    tax10: row.tax10,
    tax8: row.tax8,
    receivedAmount: row.received_amount,
    change: row.change,
    paymentAmount: row.payment_amount,
    customerCount: row.customer_count,
    menuItems,
  }
}

/** 売上レコードをSupabaseに保存（既存は削除してから一括投入） */
export async function saveSalesRecords(records: SalesRecord[]): Promise<{
  success: boolean
  error?: string
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabaseが設定されていません' }
  }
  try {
    await supabase.from('sales_records').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (records.length === 0) return { success: true }
    const rows = records.map((r) => ({
      order_id: r.orderId,
      table_name: r.table,
      staff: r.staff,
      payment_method: r.paymentMethod,
      date_time: r.dateTime.toISOString(),
      date_string: r.dateString,
      type: r.type,
      subtotal: r.subtotal,
      discount: r.discount,
      coupon_discount: r.couponDiscount,
      tax: r.tax,
      tax10: r.tax10,
      tax8: r.tax8,
      received_amount: r.receivedAmount,
      change: r.change,
      payment_amount: r.paymentAmount,
      customer_count: r.customerCount,
      menu_items: r.menuItems,
    }))
    const { error } = await supabase.from('sales_records').insert(rows)
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : '保存に失敗しました',
    }
  }
}

/** 売上レコードをSupabaseから取得 */
export async function fetchSalesRecords(): Promise<{
  records: SalesRecord[]
  error?: string
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { records: [] }
  }
  try {
    const { data, error } = await supabase
      .from('sales_records')
      .select('*')
      .order('date_time', { ascending: true })
    if (error) return { records: [], error: error.message }
    const records = (data ?? []).map(rowToSalesRecord)
    return { records }
  } catch (e) {
    return {
      records: [],
      error: e instanceof Error ? e.message : '読み込みに失敗しました',
    }
  }
}

/** 目標をSupabaseに保存（daily/weekly/monthly を upsert） */
export async function saveSalesTargets(targets: SalesTarget[]): Promise<{
  success: boolean
  error?: string
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabaseが設定されていません' }
  }
  try {
    const now = new Date().toISOString()
    for (const t of targets) {
      const { error } = await supabase
        .from('sales_targets')
        .upsert(
          {
            type: t.type,
            amount: t.amount,
            period: t.period ?? null,
            updated_at: now,
          },
          { onConflict: 'type' }
        )
      if (error) return { success: false, error: error.message }
    }
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : '保存に失敗しました',
    }
  }
}

/** 目標をSupabaseから取得 */
export async function fetchSalesTargets(): Promise<{
  targets: SalesTarget[]
  error?: string
}> {
  if (!isSupabaseConfigured() || !supabase) {
    return { targets: [] }
  }
  try {
    const { data, error } = await supabase.from('sales_targets').select('type, amount, period')
    if (error) return { targets: [], error: error.message }
    const targets: SalesTarget[] = (data ?? []).map((row) => ({
      type: row.type as 'daily' | 'weekly' | 'monthly',
      amount: row.amount,
      period: row.period ?? undefined,
    }))
    return { targets }
  } catch (e) {
    return {
      targets: [],
      error: e instanceof Error ? e.message : '読み込みに失敗しました',
    }
  }
}
