'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from './OnboardingWizard'
import { cn } from '@/lib/utils'

interface GoalSelectorProps {
  stepIndex?: number
  onChange?: (data: GoalData) => void
}

export interface GoalData {
  goal: string | ''
}

export interface GoalOption {
  value: string
  labelKey: string
  descriptionKey: string
  multiplier: number
}

const GOALS: GoalOption[] = [
  { value: 'lose', labelKey: 'lose', descriptionKey: 'loseDesc', multiplier: -500 },
  { value: 'maintain', labelKey: 'maintain', descriptionKey: 'maintainDesc', multiplier: 0 },
  { value: 'gain', labelKey: 'gain', descriptionKey: 'gainDesc', multiplier: 500 }
]

export function GoalSelector({ stepIndex = 0, onChange }: GoalSelectorProps) {
  const { t } = useTranslation()
  const { registerValidate, unregisterValidate } = useOnboarding()
  
  const [selectedGoal, setSelectedGoal] = React.useState<GoalData>({
    goal: ''
  })
  
  const [error, setError] = React.useState<string | null>(null)
  const [touched, setTouched] = React.useState(false)

  const validate = React.useCallback((): boolean => {
    if (selectedGoal.goal === '') {
      setError(t('validation.required'))
      return false
    }
    setError(null)
    return true
  }, [selectedGoal, t])

  React.useEffect(() => {
    registerValidate(stepIndex, validate)
    return () => {
      unregisterValidate(stepIndex)
    }
  }, [registerValidate, unregisterValidate, stepIndex, validate])

  const handleSelect = (value: string) => {
    const updated = { goal: value }
    setSelectedGoal(updated)
    setTouched(true)
    setError(null)
    onChange?.(updated)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 id="goal-label" className="text-2xl font-semibold">{t('onboarding.goal')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('onboarding.goalSubtitle')}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-labelledby="goal-label"
        aria-describedby={error ? 'goal-error' : undefined}
        className="space-y-3"
      >
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            type="button"
            onClick={() => handleSelect(goal.value)}
            role="radio"
            aria-checked={selectedGoal.goal === goal.value}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              'hover:bg-accent hover:text-accent-foreground',
              selectedGoal.goal === goal.value
                ? 'border-primary bg-primary/10'
                : 'border-input'
            )}
          >
             <div className="flex items-start justify-between">
               <div className="flex-1">
                 <span className="font-medium text-sm block mb-1">
                   {t(`onboarding.${goal.labelKey}`)}
                 </span>
                 <span className="text-muted-foreground text-xs block">
                   {t(`onboarding.${goal.descriptionKey}`)}
                 </span>
               </div>
               <div className="ml-3 flex items-center justify-center h-5 w-5 rounded-full border-2">
                 {selectedGoal.goal === goal.value && (
                   <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                 )}
               </div>
             </div>
          </button>
        ))}
      </div>

      {error && touched && (
        <p id="goal-error" className="text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
