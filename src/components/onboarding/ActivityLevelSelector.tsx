'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from './OnboardingWizard'
import { cn } from '@/lib/utils'

interface ActivityLevelSelectorProps {
  stepIndex?: number
  onChange?: (data: ActivityLevelData) => void
}

export interface ActivityLevelData {
  activityLevel: number | ''
}

export interface ActivityLevelOption {
  value: number
  labelKey: string
}

const ACTIVITY_LEVELS: ActivityLevelOption[] = [
  { value: 1.2, labelKey: 'sedentary' },
  { value: 1.375, labelKey: 'light' },
  { value: 1.55, labelKey: 'moderate' },
  { value: 1.725, labelKey: 'active' },
  { value: 1.9, labelKey: 'veryActive' }
]

export function ActivityLevelSelector({ stepIndex = 0, onChange }: ActivityLevelSelectorProps) {
  const { t } = useTranslation()
  const { registerValidate, unregisterValidate } = useOnboarding()
  
  const [selectedLevel, setSelectedLevel] = React.useState<ActivityLevelData>({
    activityLevel: ''
  })
  
  const [error, setError] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState(false)

  const validate = React.useCallback((): boolean => {
    if (selectedLevel.activityLevel === '') {
      setError(t('validation.required'))
      return false
    }
    setError(null)
    return true
  }, [selectedLevel, t])

  React.useEffect(() => {
    registerValidate(stepIndex, validate)
    return () => {
      unregisterValidate(stepIndex)
    }
  }, [registerValidate, unregisterValidate, stepIndex, validate])

  const handleSelect = (value: number) => {
    const updated = { activityLevel: value }
    setSelectedLevel(updated)
    setTouched(true)
    setError(null)
    onChange?.(updated)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 id="activity-level-label" className="text-2xl font-semibold">{t('onboarding.activityLevel')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('onboarding.activityLevelSubtitle')}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="activity-level-label"
        aria-describedby={error ? 'activity-level-error' : undefined}
        className="space-y-3"
      >
        {ACTIVITY_LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => handleSelect(level.value)}
            role="radio"
            aria-checked={selectedLevel.activityLevel === level.value}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              'hover:bg-accent hover:text-accent-foreground',
              selectedLevel.activityLevel === level.value
                ? 'border-primary bg-primary/10'
                : 'border-input'
            )}
          >
             <div className="flex items-start justify-between">
               <div className="flex-1">
                 <span className="font-medium text-sm block">
                   {t(`onboarding.${level.labelKey}`)}
                 </span>
               </div>
               <div className="ml-3 flex items-center justify-center h-5 w-5 rounded-full border-2">
                 {selectedLevel.activityLevel === level.value && (
                   <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                 )}
               </div>
             </div>
          </button>
        ))}
      </div>

      {error && touched && (
        <p id="activity-level-error" className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
