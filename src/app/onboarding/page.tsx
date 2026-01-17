'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { PersonalInfoForm, type PersonalInfoData } from '@/components/onboarding/PersonalInfoForm'
import { ActivityLevelSelector, type ActivityLevelData } from '@/components/onboarding/ActivityLevelSelector'
import { GoalSelector, type GoalData } from '@/components/onboarding/GoalSelector'
import { TargetReview, type TargetData } from '@/components/onboarding/TargetReview'
import { ApiKeySetup, type ApiKeyData } from '@/components/onboarding/ApiKeySetup'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Card, CardContent } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const { createUserProfile, getUserProfile, loading } = useUserProfile()

  const [onboardingData, setOnboardingData] = React.useState<{
    personalInfo: PersonalInfoData
    activityLevel: ActivityLevelData
    goal: GoalData
    targets: TargetData
    apiKey: ApiKeyData
    language: 'en' | 'es'
  }>({
    personalInfo: { age: '', weight: '', height: '', gender: '' },
    activityLevel: { activityLevel: '' },
    goal: { goal: '', multiplier: 0 },
    targets: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    apiKey: { apiKey: '' },
    language: 'en'
  })

  const [isCheckingProfile, setIsCheckingProfile] = React.useState(true)
  const [isCreatingProfile, setIsCreatingProfile] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const existingProfile = await getUserProfile()
        if (existingProfile) {
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('Error checking profile:', err)
      } finally {
        setIsCheckingProfile(false)
      }
    }

    checkExistingProfile()
  }, [getUserProfile, router])

  const handlePersonalInfoChange = (data: PersonalInfoData) => {
    setOnboardingData(prev => ({ ...prev, personalInfo: data }))
  }

  const handleActivityLevelChange = (data: ActivityLevelData) => {
    setOnboardingData(prev => ({ ...prev, activityLevel: data }))
  }

  const handleGoalChange = (data: GoalData) => {
    setOnboardingData(prev => ({ ...prev, goal: data }))
  }

  const handleTargetsChange = (data: TargetData) => {
    setOnboardingData(prev => ({ ...prev, targets: data }))
  }

  const handleApiKeyChange = (data: ApiKeyData) => {
    setOnboardingData(prev => ({ ...prev, apiKey: data }))
  }

  const handleComplete = async () => {
    setIsCreatingProfile(true)
    setError(null)

    try {
      const { personalInfo, activityLevel, goal, targets, apiKey } = onboardingData

      if (!personalInfo.age || !personalInfo.weight || !personalInfo.height || !personalInfo.gender) {
        throw new Error('Missing personal information')
      }

      if (!activityLevel.activityLevel) {
        throw new Error('Missing activity level')
      }

      if (!goal.goal) {
        throw new Error('Missing goal')
      }

      if (!targets.calories || !targets.protein || !targets.carbs || !targets.fat) {
        throw new Error('Missing targets')
      }

      const language = i18n.language as 'en' | 'es'
      localStorage.setItem('openmacros-language', language)

      await createUserProfile({
        name: 'User',
        targetCalories: targets.calories,
        targetProtein: targets.protein,
        targetCarbs: targets.carbs,
        targetFat: targets.fat,
        openRouterApiKey: apiKey.apiKey || undefined,
        language
      })

      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile'
      setError(errorMessage)
      setIsCreatingProfile(false)
    }
  }

  const handleCancel = () => {
    router.push('/')
  }

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{t('common.loading')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-destructive">{t('common.error')}</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null)
                setIsCreatingProfile(false)
              }}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
            >
              {t('common.retry')}
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isCreatingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{t('common.loading')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <OnboardingWizard
        totalSteps={6}
        onComplete={handleComplete}
        onCancel={handleCancel}
      >
        <PersonalInfoForm
          stepIndex={0}
          onChange={handlePersonalInfoChange}
        />
        <ActivityLevelSelector
          stepIndex={1}
          onChange={handleActivityLevelChange}
        />
        <GoalSelector
          stepIndex={2}
          onChange={handleGoalChange}
        />
        <TargetReview
          stepIndex={3}
          personalInfo={{
            age: onboardingData.personalInfo.age as number,
            weight: onboardingData.personalInfo.weight as number,
            height: onboardingData.personalInfo.height as number,
            gender: onboardingData.personalInfo.gender as 'male' | 'female'
          }}
          activityLevel={onboardingData.activityLevel.activityLevel as number}
          goal={{
            value: onboardingData.goal.goal as 'lose' | 'maintain' | 'gain',
            multiplier: onboardingData.goal.multiplier
          }}
          onChange={handleTargetsChange}
        />
        <ApiKeySetup
          stepIndex={4}
          onChange={handleApiKeyChange}
        />
        <div className="space-y-6 py-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">{t('onboarding.complete')}</h2>
            <p className="text-muted-foreground text-sm">
              {t('onboarding.completeSubtitle')}
            </p>
          </div>
        </div>
      </OnboardingWizard>
    </div>
  )
}
