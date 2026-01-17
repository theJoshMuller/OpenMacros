'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type UserProfile = {
  id: string
  name: string
  targetCalories: number
  targetProtein: number
  targetCarbs: number
  targetFat: number
  openRouterApiKey?: string
  selectedModel?: string
  modelTag?: string
  language: 'en' | 'es'
  deviceId: string
  createdAt: number
  updatedAt: number
}

interface TargetData {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { getUserProfile, updateUserProfile, loading, error } = useUserProfile()

  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [targets, setTargets] = React.useState<TargetData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  })
  const [apiKey, setApiKey] = React.useState('')
  const [language, setLanguage] = React.useState<'en' | 'es'>('en')
  const [saving, setSaving] = React.useState(false)
  const [saveMessage, setSaveMessage] = React.useState<{ type: 'success' | 'error', message: string } | null>(null)

  React.useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const userProfile = await getUserProfile()
      if (userProfile) {
        setProfile(userProfile)
        setTargets({
          calories: userProfile.targetCalories,
          protein: userProfile.targetProtein,
          carbs: userProfile.targetCarbs,
          fat: userProfile.targetFat
        })
        setApiKey(userProfile.openRouterApiKey || '')
        setLanguage(userProfile.language)
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
    }
  }

  const handleSaveTargets = async () => {
    if (!profile) return

    setSaving(true)
    setSaveMessage(null)

    try {
      await updateUserProfile(profile.id, {
        targetCalories: targets.calories,
        targetProtein: targets.protein,
        targetCarbs: targets.carbs,
        targetFat: targets.fat
      })
      setSaveMessage({ type: 'success', message: t('settings.targets') + ' saved' })
    } catch (err) {
      setSaveMessage({ type: 'error', message: t('common.error') || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!profile) return

    setSaving(true)
    setSaveMessage(null)

    try {
      await updateUserProfile(profile.id, {
        openRouterApiKey: apiKey
      })
      setSaveMessage({ type: 'success', message: t('settings.apiKey') + ' saved' })
    } catch (err) {
      setSaveMessage({ type: 'error', message: t('common.error') || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleLanguageChange = async (newLang: 'en' | 'es') => {
    if (!profile) return

    setSaving(true)
    setSaveMessage(null)

    try {
      await updateUserProfile(profile.id, {
        language: newLang
      })
      setLanguage(newLang)
      setSaveMessage({ type: 'success', message: t('settings.language') + ' saved' })
    } catch (err) {
      setSaveMessage({ type: 'error', message: t('common.error') || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  const handleRecalculateTDEE = () => {
    alert(t('settings.recalculateTDEE') + ' - Coming soon!')
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive">{t('common.error')}</p>
          <Button onClick={loadProfile}>{t('common.retry')}</Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found. Please complete onboarding.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('settings.title')}</h1>
      </div>

      {saveMessage && (
        <div className={cn(
          'p-3 rounded-md text-sm',
          saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        )}>
          {saveMessage.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile')}</CardTitle>
          <CardDescription>Your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">{t('common.name') || 'Name'}</p>
            <p className="font-medium">{profile.name}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.targets')}</CardTitle>
          <CardDescription>Edit your daily nutrition targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="calories" className="text-sm font-medium">
              {t('common.calories')}
            </label>
            <Input
              id="calories"
              type="number"
              value={targets.calories}
              onChange={(e) => setTargets({ ...targets, calories: Number(e.target.value) })}
              min={1}
              max={10000}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="protein" className="text-sm font-medium">
                {t('common.protein')} (g)
              </label>
              <Input
                id="protein"
                type="number"
                value={targets.protein}
                onChange={(e) => setTargets({ ...targets, protein: Number(e.target.value) })}
                min={1}
                max={1000}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="carbs" className="text-sm font-medium">
                {t('common.carbs')} (g)
              </label>
              <Input
                id="carbs"
                type="number"
                value={targets.carbs}
                onChange={(e) => setTargets({ ...targets, carbs: Number(e.target.value) })}
                min={1}
                max={1000}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fat" className="text-sm font-medium">
                {t('common.fat')} (g)
              </label>
              <Input
                id="fat"
                type="number"
                value={targets.fat}
                onChange={(e) => setTargets({ ...targets, fat: Number(e.target.value) })}
                min={1}
                max={1000}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveTargets} disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
            <Button variant="outline" onClick={handleRecalculateTDEE}>
              {t('settings.recalculateTDEE')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.apiSettings')}</CardTitle>
          <CardDescription>Configure your AI API settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              {t('settings.apiKey')}
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('onboarding.apiKeyOptional') || 'Optional, can add later'}
            />
          </div>

          <Button onClick={handleSaveApiKey} disabled={saving}>
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appSettings')}</CardTitle>
          <CardDescription>App preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('settings.language')}</label>
            <div className="flex gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('en')}
                disabled={saving}
              >
                {t('onboarding.english')}
              </Button>
              <Button
                variant={language === 'es' ? 'default' : 'outline'}
                onClick={() => handleLanguageChange('es')}
                disabled={saving}
              >
                {t('onboarding.spanish')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.dataManagement')}</CardTitle>
          <CardDescription>Manage your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button variant="outline" className="w-full" disabled>
              {t('settings.exportData')}
            </Button>
            <Button variant="outline" className="w-full" disabled>
              {t('settings.importData')}
            </Button>
            <Button variant="destructive" className="w-full" disabled>
              {t('settings.resetData')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
