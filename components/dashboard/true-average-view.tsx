'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MergedAnalysisRecord } from '@/lib/data-merger'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TrueAverageViewProps {
    records: MergedAnalysisRecord[]
}

export function TrueAverageView({ records }: TrueAverageViewProps) {
    const downloadCSV = () => {
        const header = ['日付', '伝票番号', 'メニュー名', '会計合計金額', '真の来店人数', '真の客単価']
        const csvContent = [
            header.join(','),
            ...records.map(r => [
                r.date,
                r.orderId,
                `"${r.menuNames.replace(/"/g, '""')}"`,
                r.totalAmount,
                r.actualCustomerCount,
                Math.round(r.trueAverageSpend),
                r.isMatched ? '突合済み' : '未突合（レジ人数使用）'
            ].join(','))
        ].join('\n')

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `真の客単価分析_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    // 統計情報の計算
    const matchedRecords = records.filter(r => r.isMatched)
    const avgTrueSpend = matchedRecords.length > 0
        ? matchedRecords.reduce((acc, curr) => acc + curr.trueAverageSpend, 0) / matchedRecords.length
        : 0

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">平均の真の客単価</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">¥{Math.round(avgTrueSpend).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">※来店記録と突合できたデータのみ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">データ突合率</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {records.length > 0 ? Math.round((matchedRecords.length / records.length) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">{matchedRecords.length} / {records.length} 件</p>
                    </CardContent>
                </Card>
                <Card className="flex items-center justify-center">
                    <Button onClick={downloadCSV} variant="outline" className="gap-2">
                        <Download className="size-4" />
                        分析結果をCSVダウンロード
                    </Button>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>取引別詳細</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border max-h-[600px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>日付</TableHead>
                                    <TableHead>伝票番号</TableHead>
                                    <TableHead>メニュー名</TableHead>
                                    <TableHead className="text-right">会計合計金額</TableHead>
                                    <TableHead className="text-right">真の来店人数</TableHead>
                                    <TableHead className="text-right text-primary font-bold">真の客単価</TableHead>
                                    <TableHead>状態</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                            データがありません。売上CSVと来店記録が必要です。
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.map((record, i) => (
                                        <TableRow key={`${record.orderId}-${i}`}>
                                            <TableCell className="whitespace-nowrap">{record.date}</TableCell>
                                            <TableCell>{record.orderId}</TableCell>
                                            <TableCell className="max-w-xs truncate" title={record.menuNames}>
                                                {record.menuNames}
                                            </TableCell>
                                            <TableCell className="text-right">¥{record.totalAmount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {record.actualCustomerCount}名
                                            </TableCell>
                                            <TableCell className="text-right text-primary font-bold">
                                                ¥{Math.round(record.trueAverageSpend).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${record.isMatched ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {record.isMatched ? '突合完了' : '未突合'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
