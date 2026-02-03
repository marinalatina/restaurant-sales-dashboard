'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TargetSettings } from './target-settings'
import { CSVUploader } from './csv-uploader'
import { type SalesTarget } from '@/lib/sales-store'

interface SettingsViewProps {
    targets: SalesTarget[]
    onTargetSave: (targets: SalesTarget[]) => void
    onFileUpload: (file: File) => Promise<void>
    isLoading: boolean
}

export function SettingsView({ targets, onTargetSave, onFileUpload, isLoading }: SettingsViewProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-4">設定</h2>
                <p className="text-muted-foreground mb-6">
                    売上データのアップロードと目標設定を管理します
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CSV Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>データ管理</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CSVUploader
                            onFileUpload={onFileUpload}
                            isLoading={isLoading}
                            title="売上データ (レジ)"
                        />
                    </CardContent>
                </Card>

                {/* Target Settings Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>目標設定</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TargetSettings targets={targets} onSave={onTargetSave} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
