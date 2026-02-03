
import { NextResponse } from 'next/server'

export async function GET() {
    const SHEET_ID = '1kmkGAhI4GLUfp5Y6IKBbIE26yArAvR_iec-8TkLwCcY'
    const GID = '1540962548'
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`

    try {
        const response = await fetch(CSV_URL)
        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch Google Sheet' },
                { status: response.status }
            )
        }

        const text = await response.text()
        return new NextResponse(text, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Cache-Control': 'no-store, max-age=0',
            },
        })
    } catch (error) {
        console.error('Error fetching customer data:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
