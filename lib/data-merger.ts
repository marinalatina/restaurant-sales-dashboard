import { SalesRecord } from './csv-parser'
import { CustomerTransaction } from './customer-parser'

export interface MergedAnalysisRecord {
    date: string
    orderId: string
    menuNames: string
    totalAmount: number
    actualCustomerCount: number
    trueAverageSpend: number
    segment: string
    isMatched: boolean
}

/**
 * 伝票番号を正規化します（数値として解釈し、先頭の0を除去した文字列にします）
 */
function normalizeOrderId(id: string): string {
    if (!id) return ''
    // 数字以外が含まれる可能性（「No.001」など）も考慮して数値部分を抽出
    const match = id.match(/\d+/)
    if (!match) return id.trim()
    return parseInt(match[0], 10).toString()
}

/**
 * POSデータと来店記録データを突合し、真の客単価を算出します
 */
export function mergeSalesAndCustomerData(
    salesRecords: SalesRecord[],
    customerTransactions: CustomerTransaction[]
): MergedAnalysisRecord[] {
    // 検索を高速にするため、来店記録を「日付_伝票番号」でマップ化
    const customerMap = new Map<string, CustomerTransaction>()
    customerTransactions.forEach((t) => {
        if (t.orderId && t.dateString) {
            // 日付形式を統一 (YYYY-MM-DD)
            const d = new Date(t.dateString)
            if (!isNaN(d.getTime())) {
                const normalizedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                const key = `${normalizedDate}_${normalizeOrderId(t.orderId)}`
                customerMap.set(key, t)
            }
        }
    })

    return salesRecords.map((sale) => {
        const normalizedSaleId = normalizeOrderId(sale.orderId)
        // 売上側の日付も正規化して照合
        const d = new Date(sale.dateString)
        const normalizedDate = !isNaN(d.getTime())
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            : sale.dateString

        const key = `${normalizedDate}_${normalizedSaleId}`
        const customer = customerMap.get(key)

        // デフォルトは0名
        let actualCount = 0
        let isMatched = false
        let segment = '不明'

        if (customer) {
            // U列(女性) + V列(男性) + X列(赤ちゃん/不明) の人数を合算
            const totalCount = customer.maleCount + customer.femaleCount + customer.unknownCount

            actualCount = totalCount
            isMatched = true
        }

        const trueAverageSpend = actualCount > 0 ? sale.paymentAmount / actualCount : 0

        return {
            date: sale.dateString,
            orderId: sale.orderId,
            menuNames: sale.menuItems.map(m => m.name).join(', '),
            totalAmount: sale.paymentAmount,
            actualCustomerCount: actualCount,
            trueAverageSpend,
            segment: segment,
            isMatched
        }
    })
}
