'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from './OnboardingWizard'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { calculateTDEE, type TDEEInput, type TDEEResult } from '@/lib/utils/tdee'

interface TargetReviewProps {
  personalInfo: {
    age: number
    weight: number
    height: number
    gender: 'male' | 'female'
  }
  activityLevel: number
  goal: {
    value: 'lose' | 'maintain' | 'gain'
    multiplier: number
  }
  stepIndex?: number
  onChange?: (targets: TargetData) => void
}

export interface TargetData {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export function TargetReview({
  personalInfo,
  activityLevel,
  goal,
  stepIndex = 0,
  onChange
}: TargetReviewProps) {
  const { t } = useTranslation()
  const { registerValidate, unregisterValidate } = useOnboarding()

  const [targets, setTargets] = React.useState<TargetData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  })

  const [tdeeResult, setTdeeResult] = React.useState<TDEEResult | null>(null)

  const [errors, setErrors] = React.useState<Partial<Record<keyof TargetData, string>>>({})
  const [touched, setTouched] = React.useState<Partial<Record<keyof TargetData, boolean>>>({})

  React.useEffect(() => {
    if (personalInfo.age && personalInfo.weight && personalInfo.height && personalInfo.gender && activityLevel && goal.value) {
      const tdeeInput: TDEEInput = {
        age: personalInfo.age,
        weight: personalInfo.weight,
        height: personalInfo.height,
        gender: personalInfo.gender,
        activityLevel,
        goal: goal.value
      }
      const result = calculateTDEE(tdeeInput)
      setTdeeResult(result)
      setTargets({
        calories: result.targetCalories,
        protein: result.targetProtein,
        carbs: result.targetCarbs,
        fat: result.targetFat
      })
      onChange?.({
        calories: result.targetCalories,
        protein: result.targetProtein,
        carbs: result.targetCarbs,
        fat: result.targetFat
      })
    }
  }, [personalInfo, activityLevel, goal, onChange])

  const validateField = (field: keyof TargetData, value: number): string | null => {
    if (value <= 0) {
      return t('validation.positiveNumber') || 'Must be a positive number'
    }
    if (value > 10000) {
      return t('validation.tooLarge') || 'Value is too large'
    }
    return null
  }

  const validate = React.useCallback((): boolean => {
    const newErrors: Partial<Record<keyof TargetData, string>> = {}
    let isValid = true

    const keys = Object.keys(targets) as Array<keyof TargetData>
    keys.forEach((key) => {
      const error = validateField(key, targets[key])
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [targets])

  React.useEffect(() => {
    registerValidate(stepIndex, validate)
    return () => {
      unregisterValidate(stepIndex)
    }
  }, [registerValidate, unregisterValidate, stepIndex])

  const handleInputChange = (field: keyof TargetData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value)

    setTargets(prev => ({ ...prev, [field]: value }))

    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error || undefined }))
    }

    const updated = { ...targets, [field]: value }
    onChange?.(updated)
  }

  const handleBlur = (field: keyof TargetData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, targets[field])
    setErrors(prev => ({ ...prev, [field]: error || undefined }))
  }

  if (!tdeeResult) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">{t('onboarding.targetReview') || 'Review Your Targets'}</h2>
        <p className="text-muted-foreground text-sm">
          {t('onboarding.targetReviewSubtitle') || 'Based on your profile, here are your recommended targets. You can edit them if needed.'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">{t('onboarding.bmr') || 'BMR'}</p>
            <p className="text-2xl font-semibold">{tdeeResult.bmr}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">{t('onboarding.tdee') || 'TDEE'}</p>
            <p className="text-2xl font-semibold">{tdeeResult.tdee}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="calories" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('onboarding.calories') || 'Calories'}
            </label>
            <Input
              id="calories"
              type="number"
              value={targets.calories}
              onChange={handleInputChange('calories')}
              onBlur={handleBlur('calories')}
              min={1}
              max={10000}
              aria-invalid={!!errors.calories}
              aria-describedby={errors.calories ? 'calories-error' : undefined}
              className={cn(
                errors.calories && 'border-destructive focus-visible:ring-destructive/20'
              )}
            />
            {errors.calories && (
              <p id="calories-error" className="text-sm text-destructive" role="alert">
                {errors.calories}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="protein" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t('onboarding.protein') || 'Protein (g)'}
              </label>
              <Input
                id="protein"
                type="number"
                value={targets.protein}
                onChange={handleInputChange('protein')}
                onBlur={handleBlur('protein')}
                min={1}
                max={10000}
                aria-invalid={!!errors.protein}
                aria-describedby={errors.protein ? 'protein-error' : undefined}
                className={cn(
                  errors.protein && 'border-destructive focus-visible:ring-destructive/20'
                )}
              />
              {errors.protein && (
                <p id="protein-error" className="text-sm text-destructive" role="alert">
                  {errors.protein}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="carbs" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t('onboarding.carbs') || 'Carbs (g)'}
              </label>
              <Input
                id="carbs"
                type="number"
                value={targets.carbs}
                onChange={handleInputChange('carbs')}
                onBlur={handleBlur('carbs')}
                min={1}
                max={10000}
                aria-invalid={!!errors.carbs}
                aria-describedby={errors.carbs ? 'carbs-error' : undefined}
                className={cn(
                  errors.carbs && 'border-destructive focus-visible:ring-destructive/20'
                )}
              />
              {errors.carbs && (
                <p id="carbs-error" className="text-sm text-destructive" role="alert">
                  {errors.carbs}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="fat" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t('onboarding.fat') || 'Fat (g)'}
              </label>
              <Input
                id="fat"
                type="number"
                value={targets.fat}
                onChange={handleInputChange('fat')}
                onBlur={handleBlur('fat')}
                min={1}
                max={10000}
                aria-invalid={!!errors.fat}
                aria-describedby={errors.fat ? 'fat-error' : undefined}
                className={cn(
                  errors.fat && 'border-destructive focus-visible:ring-destructive/20'
                )}
              />
              {errors.fat && (
                <p id="fat-error" className="text-sm text-destructive" role="alert">
                  {errors.fat}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
