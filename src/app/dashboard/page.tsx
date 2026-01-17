'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/ui/progress-ring'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useDailyLog } from '@/hooks/useDailyLog'
import { calculatePercentage } from '@/lib/utils/nutrition'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { getUserProfile, loading: profileLoading } = useUserProfile()
  const { getDailyLog, loading: logLoading } = useDailyLog()
  
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getUserProfile>> | null>(null)
  const [dailyLog, setDailyLog] = useState<Awaited<ReturnType<typeof getDailyLog>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const userProfile = await getUserProfile()
        if (!userProfile) {
          setError(t('dashboard.profileNotFound'))
          return
        }
        
        setProfile(userProfile)
        
        const today = new Date().toISOString().split('T')[0]
        const log = await getDailyLog(today)
        setDailyLog(log || { entries: [] } as any)
      } catch (err) {
        setError(t('dashboard.error'))
      }
    }
    
    loadData()
  }, [getUserProfile, getDailyLog, t])

  if (profileLoading || logLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={() => window.location.reload()}>
                {t('common.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const caloriePercentage = calculatePercentage(
    dailyLog?.totalCalories || 0,
    profile.targetCalories
  )
  const proteinPercentage = calculatePercentage(
    dailyLog?.totalProtein || 0,
    profile.targetProtein
  )
  const carbsPercentage = calculatePercentage(
    dailyLog?.totalCarbs || 0,
    profile.targetCarbs
  )
  const fatPercentage = calculatePercentage(
    dailyLog?.totalFat || 0,
    profile.targetFat
  )

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const sortedEntries = dailyLog?.entries
    ? [...dailyLog.entries].sort((a, b) => a.timestamp - b.timestamp)
    : []

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {t('dashboard.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{formattedDate}</p>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <ProgressRing
                percentage={caloriePercentage}
                label={t('common.calories')}
                value={dailyLog?.totalCalories || 0}
                target={profile.targetCalories}
              />
              <ProgressRing
                percentage={proteinPercentage}
                label={t('common.protein')}
                value={Math.round(dailyLog?.totalProtein || 0)}
                target={profile.targetProtein}
              />
              <ProgressRing
                percentage={carbsPercentage}
                label={t('common.carbs')}
                value={Math.round(dailyLog?.totalCarbs || 0)}
                target={profile.targetCarbs}
              />
              <ProgressRing
                percentage={fatPercentage}
                label={t('common.fat')}
                value={Math.round(dailyLog?.totalFat || 0)}
                target={profile.targetFat}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="default" 
                size="lg"
                className="w-full"
                onClick={() => router.push('/food-entry')}
              >
                {t('dashboard.addFood')}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full"
              >
                {t('dashboard.addMeal')}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full"
              >
                {t('dashboard.scanPhoto')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t('dashboard.todaysEntries')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('dashboard.noEntries')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEntries.map((entry, index) => {
                  const entryTime = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">
                            {entryTime}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {entry.type === 'meal' ? t('dashboard.addMeal') : t('dashboard.addFood')}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">
                            {entry.quantity}x
                          </span>
                          <span className="ml-1 text-muted-foreground">
                            {entry.calories} {t('common.calories').toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{entry.protein}g {t('common.protein').toLowerCase()}</div>
                        <div>{entry.carbs}g {t('common.carbs').toLowerCase()}</div>
                        <div>{entry.fat}g {t('common.fat').toLowerCase()}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
