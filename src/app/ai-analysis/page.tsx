'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera } from '@/components/ai-analysis/Camera'
import { AnalysisResult, AnalysisResultData } from '@/components/ai-analysis/AnalysisResult'
import { analyzeFood } from '@/lib/api/openRouter'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useDailyLog } from '@/hooks/useDailyLog'

type Step = 'camera' | 'analyzing' | 'result' | 'error'

export default function AIAnalysisPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { getUserProfile } = useUserProfile()
  const { addEntry } = useDailyLog()

  const [step, setStep] = useState<Step>('camera')
  const [imageData, setImageData] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageCapture = (data: string) => {
    setImageData(data)
  }

  const handleAnalyze = async () => {
    if (!imageData) return

    setStep('analyzing')
    setError(null)

    try {
      const profile = await getUserProfile()
      if (!profile?.openRouterApiKey) {
        setError(t('aiAnalysis.failed') + ': ' + 'No API key found')
        setStep('error')
        return
      }

      const result = await analyzeFood({
        imageData,
        apiKey: profile.openRouterApiKey,
        model: profile.selectedModel,
      })

      setAnalysisResult(result)
      setStep('result')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(t('aiAnalysis.failed') + ': ' + errorMessage)
      setStep('error')
    }
  }

  const handleSaveToLibrary = (data: AnalysisResultData) => {
    router.push('/dashboard')
  }

  const handleAddToLog = async (logData: {
    foodId: string
    quantity: number
    calories: number
    protein: number
    carbs: number
    fat: number
  }) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      await addEntry(today, {
        type: 'food',
        itemId: logData.foodId,
        quantity: logData.quantity,
        calories: logData.calories,
        protein: logData.protein,
        carbs: logData.carbs,
        fat: logData.fat,
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to add to log:', err)
      setError(err instanceof Error ? err.message : 'Failed to add to log')
    }
  }

  const handleRetry = () => {
    setStep('camera')
    setError(null)
  }

  const handleManualEntry = () => {
    router.push('/food-entry')
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {t('aiAnalysis.title')}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'camera' && (
              <div className="space-y-4">
                <Camera onChange={handleImageCapture} />
                {imageData && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalyze}
                      className="flex-1"
                      size="lg"
                    >
                      {t('aiAnalysis.analyze')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === 'analyzing' && (
              <div className="text-center py-8">
                <p className="text-lg font-medium mb-2">
                  {t('aiAnalysis.analyzing')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('common.loading')}
                </p>
              </div>
            )}

            {step === 'result' && analysisResult && (
              <AnalysisResult
                initialData={analysisResult}
                onSave={handleSaveToLibrary}
                onAddToLog={handleAddToLog}
              />
            )}

            {step === 'error' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">
                    {error}
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={handleRetry}
                      className="w-full"
                    >
                      {t('aiAnalysis.retry')}
                    </Button>
                    <Button
                      onClick={handleManualEntry}
                      variant="outline"
                      className="w-full"
                    >
                      {t('aiAnalysis.manualEntry')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
