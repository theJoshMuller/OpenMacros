'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from './OnboardingWizard'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PersonalInfoFormProps {
  stepIndex?: number
  onChange?: (data: PersonalInfoData) => void
}

export interface PersonalInfoData {
  age: number | ''
  weight: number | ''
  height: number | ''
  gender: 'male' | 'female' | ''
}

export function PersonalInfoForm({ stepIndex = 0, onChange }: PersonalInfoFormProps) {
  const { t } = useTranslation()
  const { registerValidate, unregisterValidate } = useOnboarding()
  
  const [formData, setFormData] = React.useState<PersonalInfoData>({
    age: '',
    weight: '',
    height: '',
    gender: ''
  })
  
  const [errors, setErrors] = React.useState<Partial<Record<keyof PersonalInfoData, string>>>({})
  const [touched, setTouched] = React.useState<Partial<Record<keyof PersonalInfoData, boolean>>>({})

  const validateField = (field: keyof PersonalInfoData, value: PersonalInfoData[keyof PersonalInfoData]): string | null => {
    switch (field) {
      case 'age':
        if (value === '') return t('validation.required')
        const age = Number(value)
        if (isNaN(age)) return t('validation.numberRequired')
        if (age < 18 || age > 100) return t('validation.ageRange')
        return null
      case 'weight':
        if (value === '') return t('validation.required')
        const weight = Number(value)
        if (isNaN(weight)) return t('validation.numberRequired')
        if (weight < 30 || weight > 200) return t('validation.weightRange')
        return null
      case 'height':
        if (value === '') return t('validation.required')
        const height = Number(value)
        if (isNaN(height)) return t('validation.numberRequired')
        if (height < 100 || height > 250) return t('validation.heightRange')
        return null
      case 'gender':
        if (value === '') return t('validation.genderRequired')
        return null
      default:
        return null
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalInfoData, string>> = {}
    let isValid = true

    Object.keys(formData).forEach((key) => {
      const field = key as keyof PersonalInfoData
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  React.useEffect(() => {
    registerValidate(stepIndex, validate)
    return () => {
      unregisterValidate(stepIndex)
    }
  }, [registerValidate, unregisterValidate, stepIndex])

  const handleInputChange = (field: keyof PersonalInfoData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = (e.target.type === 'number'
      ? (e.target.value === '' ? '' : Number(e.target.value))
      : e.target.value) as PersonalInfoData[keyof PersonalInfoData]

    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      if (touched[field]) {
        const error = validateField(field, value)
        setErrors(errors => ({ ...errors, [field]: error || undefined }) as Partial<Record<keyof PersonalInfoData, string>>)
      }
      onChange?.(updated)
      return updated
    })
  }

  const handleBlur = (field: keyof PersonalInfoData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    setErrors(prev => ({ ...prev, [field]: error || undefined }))
  }

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setFormData(prev => {
      const updated = { ...prev, gender }
      setTouched(touched => ({ ...touched, gender: true }))
      setErrors(errors => ({ ...errors, gender: undefined }))
      onChange?.(updated)
      return updated
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">{t('onboarding.personalInfo')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('onboarding.personalInfoSubtitle') || 'Please enter your personal information'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('onboarding.age')}
          </label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange('age')}
            onBlur={handleBlur('age')}
            placeholder={t('onboarding.agePlaceholder') || '25'}
            min={18}
            max={100}
            aria-invalid={!!errors.age}
            aria-describedby={errors.age ? 'age-error' : undefined}
            className={cn(
              errors.age && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
          {errors.age && (
            <p id="age-error" className="text-sm text-destructive" role="alert">
              {errors.age}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="weight" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('onboarding.weight')}
          </label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={handleInputChange('weight')}
            onBlur={handleBlur('weight')}
            placeholder={t('onboarding.weightPlaceholder') || '70'}
            min={30}
            max={200}
            aria-invalid={!!errors.weight}
            aria-describedby={errors.weight ? 'weight-error' : undefined}
            className={cn(
              errors.weight && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
          {errors.weight && (
            <p id="weight-error" className="text-sm text-destructive" role="alert">
              {errors.weight}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="height" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('onboarding.height')}
          </label>
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={handleInputChange('height')}
            onBlur={handleBlur('height')}
            placeholder={t('onboarding.heightPlaceholder') || '175'}
            min={100}
            max={250}
            aria-invalid={!!errors.height}
            aria-describedby={errors.height ? 'height-error' : undefined}
            className={cn(
              errors.height && 'border-destructive focus-visible:ring-destructive/20'
            )}
          />
          {errors.height && (
            <p id="height-error" className="text-sm text-destructive" role="alert">
              {errors.height}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label id="gender-label" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('onboarding.gender')}
          </label>
          <div
            role="radiogroup"
            aria-labelledby="gender-label"
            aria-describedby={errors.gender ? 'gender-error' : undefined}
            className="grid grid-cols-2 gap-3"
          >
            <button
              type="button"
              onClick={() => handleGenderSelect('male')}
              role="radio"
              aria-checked={formData.gender === 'male'}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                'hover:bg-accent hover:text-accent-foreground',
                formData.gender === 'male'
                  ? 'border-primary bg-primary/10'
                  : 'border-input'
              )}
            >
              <span className="text-lg font-medium">{t('onboarding.male')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenderSelect('female')}
              role="radio"
              aria-checked={formData.gender === 'female'}
              className={cn(
                'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all',
                'hover:bg-accent hover:text-accent-foreground',
                formData.gender === 'female'
                  ? 'border-primary bg-primary/10'
                  : 'border-input'
              )}
            >
              <span className="text-lg font-medium">{t('onboarding.female')}</span>
            </button>
          </div>
          {errors.gender && (
            <p id="gender-error" className="text-sm text-destructive" role="alert">
              {errors.gender}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
