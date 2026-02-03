export interface CustomerTransaction {
    timestamp: Date
    dateString: string // YYYY-MM-DD
    maleCount: number
    femaleCount: number
    unknownCount: number
    totalCount: number
    orderId: string // Q2: 伝票番号

    // Age Groups
    ageElementary: number // 小学生以下
    ageStudent: number    // 中高生
    ageYoung: number      // 20〜30代
    ageMiddle: number     // 40〜50代
    ageSenior: number     // 60代以上
}

export interface CustomerSummary {
    date: string
    total: number
    male: number
    female: number
    unknown: number

    // Age Groups
    ageElementary: number
    ageStudent: number
    ageYoung: number
    ageMiddle: number
    ageSenior: number
}

// Helper to parse Google Forms timestamp "2/1/2026 11:16:13" or "yyyy/MM/dd..."
function parseDate(dateStr: string): Date {
    if (!dateStr) return new Date()
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
        // Try manual parsing if standard fails
        const match = dateStr.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/)
        if (match) {
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
        }
        return new Date()
    }
    return date
}

function parseCount(str: string | undefined): number {
    if (!str) return 0
    // "1人" -> 1, "2" -> 2
    const num = parseInt(str.replace(/[^0-9]/g, ''))
    return isNaN(num) ? 0 : num
}

// Robust CSV Parser handling quoted multiline fields
function parseCSV(text: string): string[][] {
    const rows: string[][] = []
    let currentRow: string[] = []
    let currentField = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const nextChar = text[i + 1]

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote: "" -> "
                currentField += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField)
            currentField = ''
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++ // Skip \n in \r\n
            currentRow.push(currentField)
            rows.push(currentRow)
            currentRow = []
            currentField = ''
        } else {
            currentField += char
        }
    }

    // Push last row if exists
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField)
        rows.push(currentRow)
    }

    return rows
}

export function parseCustomerCSVContent(text: string): CustomerTransaction[] {
    const rows = parseCSV(text)
    if (rows.length < 2) return []

    const header = rows[0]

    // Find column indices dynamically
    const idxTimestamp = header.findIndex(h => h.includes('Timestamp'))
    const idxOrderId = header.findIndex(h => h.includes('Q2') && h.includes('伝票番号'))

    // Gender
    const idxFemale = header.findIndex(h => h.includes('女性') && h.includes('Mahila'))
    const idxMale = header.findIndex(h => h.includes('男性') && h.includes('Purusha'))
    const idxUnknown = header.findIndex(h => h.includes('性別不明') || h.includes('赤ちゃん'))

    // Age Groups
    const idxAgeElementary = header.findIndex(h => h.includes('小学生以下'))
    const idxAgeStudent = header.findIndex(h => h.includes('中高生'))
    const idxAgeYoung = header.findIndex(h => h.includes('20〜30代'))
    const idxAgeMiddle = header.findIndex(h => h.includes('40〜50代'))
    const idxAgeSenior = header.findIndex(h => h.includes('60代以上'))

    const records: CustomerTransaction[] = []

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i]
        if (cols.length < 2) continue

        const timestampStr = idxTimestamp !== -1 ? cols[idxTimestamp] : ''
        const date = parseDate(timestampStr)
        const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')

        // Gender counts
        const female = idxFemale !== -1 ? parseCount(cols[idxFemale]) : 0
        const male = idxMale !== -1 ? parseCount(cols[idxMale]) : 0
        const unknown = idxUnknown !== -1 ? parseCount(cols[idxUnknown]) : 0

        // Age counts
        const ageElementary = idxAgeElementary !== -1 ? parseCount(cols[idxAgeElementary]) : 0
        const ageStudent = idxAgeStudent !== -1 ? parseCount(cols[idxAgeStudent]) : 0
        const ageYoung = idxAgeYoung !== -1 ? parseCount(cols[idxAgeYoung]) : 0
        const ageMiddle = idxAgeMiddle !== -1 ? parseCount(cols[idxAgeMiddle]) : 0
        const ageSenior = idxAgeSenior !== -1 ? parseCount(cols[idxAgeSenior]) : 0

        if (female === 0 && male === 0 && unknown === 0 && ageElementary === 0 && ageStudent === 0 && ageYoung === 0 && ageMiddle === 0 && ageSenior === 0) continue

        records.push({
            timestamp: date,
            dateString,
            maleCount: male,
            femaleCount: female,
            unknownCount: unknown,
            totalCount: male + female + unknown,
            orderId: idxOrderId !== -1 ? (cols[idxOrderId] || '').trim() : '',

            ageElementary,
            ageStudent,
            ageYoung,
            ageMiddle,
            ageSenior
        })
    }

    return records
}

export async function parseCustomerCSV(file: File): Promise<CustomerTransaction[]> {
    const text = await file.text()
    return parseCustomerCSVContent(text)
}

export function aggregateByDay(records: CustomerTransaction[]): CustomerSummary[] {
    const map = new Map<string, CustomerSummary>()

    for (const r of records) {
        if (!map.has(r.dateString)) {
            map.set(r.dateString, {
                date: r.dateString,
                total: 0,
                male: 0, female: 0, unknown: 0,
                ageElementary: 0, ageStudent: 0, ageYoung: 0, ageMiddle: 0, ageSenior: 0
            })
        }
        const s = map.get(r.dateString)!
        s.male += r.maleCount
        s.female += r.femaleCount
        s.unknown += r.unknownCount
        s.total += r.totalCount

        s.ageElementary += r.ageElementary
        s.ageStudent += r.ageStudent
        s.ageYoung += r.ageYoung
        s.ageMiddle += r.ageMiddle
        s.ageSenior += r.ageSenior
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}

export function aggregateByMonth(records: CustomerTransaction[]): CustomerSummary[] {
    const map = new Map<string, CustomerSummary>()

    for (const r of records) {
        const monthStr = r.dateString.substring(0, 7) // YYYY-MM
        if (!map.has(monthStr)) {
            map.set(monthStr, {
                date: monthStr,
                total: 0,
                male: 0, female: 0, unknown: 0,
                ageElementary: 0, ageStudent: 0, ageYoung: 0, ageMiddle: 0, ageSenior: 0
            })
        }
        const s = map.get(monthStr)!
        s.male += r.maleCount
        s.female += r.femaleCount
        s.unknown += r.unknownCount
        s.total += r.totalCount

        s.ageElementary += r.ageElementary
        s.ageStudent += r.ageStudent
        s.ageYoung += r.ageYoung
        s.ageMiddle += r.ageMiddle
        s.ageSenior += r.ageSenior
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
}
