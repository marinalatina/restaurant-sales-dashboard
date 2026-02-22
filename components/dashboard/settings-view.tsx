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
        <div className="relative -m-4 md:-m-6 p-4 md:p-6 min-h-[calc(100vh-theme(spacing.14))] flex flex-col overflow-hidden rounded-lg">
            {/* Background Image with slight blur */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('/images/settings-bg.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            {/* Dark Overlay with Blur */}
            <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[2px]" />

            <div className="relative z-10 space-y-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-md">設定</h2>
                    <p className="text-white/80 mb-6 font-medium">
                        売上データのアップロードと目標設定を管理します
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CSV Upload Section */}
                    <CSVUploader
                        onFileUpload={onFileUpload}
                        isLoading={isLoading}
                        title="売上データ (レジ)"
                        className="bg-white/5 backdrop-blur-md border-white/10 text-white shadow-2xl"
                    />

                    {/* Target Settings Section */}
                    <TargetSettings
                        targets={targets}
                        onSave={onTargetSave}
                        className="bg-white/5 backdrop-blur-md border-white/10 text-white shadow-2xl"
                    />
                </div>
            </div>
        </div>
    )
}

