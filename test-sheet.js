
const SHEET_ID = '1kmkGAhI4GLUfp5Y6IKBbIE26yArAvR_iec-8TkLwCcY'
const GID = '1540962548'
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`

async function test() {
    console.log('Fetching:', CSV_URL)
    const res = await fetch(CSV_URL)
    console.log('Status:', res.status)
    const text = await res.text()
    console.log('Text length:', text.length)
    console.log('First line:', text.split('\n')[0])

    // Parser Logic Copy (simplified for test)
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '')
    const header = parseCSVLine(lines[0])
    console.log('Header:', header)

    const idxFemale = header.findIndex(h => h.includes('女性') && h.includes('Mahila'))
    const idxMale = header.findIndex(h => h.includes('男性') && h.includes('Purusha'))

    console.log('Idx Female:', idxFemale)
    console.log('Idx Male:', idxMale)

    if (lines.length > 1) {
        const row = parseCSVLine(lines[1])
        console.log('Row 1:', row)
        console.log('Female Val:', row[idxFemale])
        console.log('Male Val:', row[idxMale])
    }
}

function parseCSVLine(line) {
    const result = []
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

test()
