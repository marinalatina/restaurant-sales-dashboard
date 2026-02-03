'use client'

import React from "react"

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSVUploaderProps {
  onFileUpload: (file: File) => Promise<void>
  isLoading?: boolean
}

export function CSVUploader({ onFileUpload, isLoading }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [fileName, setFileName] = useState<string>('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith('.csv')) {
        setFileName(file.name)
        try {
          await onFileUpload(file)
          setUploadStatus('success')
        } catch {
          setUploadStatus('error')
        }
      }
    },
    [onFileUpload]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setFileName(file.name)
        try {
          await onFileUpload(file)
          setUploadStatus('success')
        } catch {
          setUploadStatus('error')
        }
      }
    },
    [onFileUpload]
  )

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="size-5" />
          CSVファイルをアップロード
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            isLoading && 'opacity-50 pointer-events-none'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadStatus === 'success' ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="size-10 text-success" />
              <p className="text-sm text-foreground font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">
                アップロード完了
              </p>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="size-10 text-destructive" />
              <p className="text-sm text-destructive font-medium">
                エラーが発生しました
              </p>
              <p className="text-xs text-muted-foreground">
                CSVファイルを確認してください
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="size-10 text-muted-foreground" />
              <div>
                <p className="text-sm text-foreground font-medium">
                  ファイルをドラッグ＆ドロップ
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  または下のボタンからファイルを選択
                </p>
              </div>
              <label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer bg-transparent"
                  asChild
                >
                  <span>ファイルを選択</span>
                </Button>
              </label>
            </div>
          )}
        </div>
        {uploadStatus !== 'idle' && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              setUploadStatus('idle')
              setFileName('')
            }}
          >
            別のファイルをアップロード
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
