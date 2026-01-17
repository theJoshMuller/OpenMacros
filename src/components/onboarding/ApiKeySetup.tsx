'use client'

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from './OnboardingWizard'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ApiKeySetupProps {
  stepIndex?: number
  onChange?: (data: ApiKeyData) => void
}

export interface ApiKeyData {
  apiKey: string
}

export function ApiKeySetup({ stepIndex = 0, onChange }: ApiKeySetupProps) {
  const { t } = useTranslation()
  const { registerValidate, unregisterValidate } = useOnboarding()

  const [apiKey, setApiKey] = React.useState<ApiKeyData>({
    apiKey: ''
  })

  const validate = React.useCallback((): boolean => {
    return true
  }, [])

  React.useEffect(() => {
    registerValidate(stepIndex, validate)
    return () => {
      unregisterValidate(stepIndex)
    }
  }, [registerValidate, unregisterValidate, stepIndex, validate])

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { apiKey: e.target.value }
    setApiKey(updated)
    onChange?.(updated)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">{t('onboarding.apiKey')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('onboarding.apiKeyOptional')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="api-key" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {t('onboarding.apiKey')}
          </label>
          <Input
            id="api-key"
            type="password"
            value={apiKey.apiKey}
            onChange={handleApiKeyChange}
            placeholder={t('onboarding.apiKeyPlaceholder') || 'sk-or-...'}
            autoComplete="off"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            {t('onboarding.apiKeyHelp') || 'Add your OpenRouter API key to enable AI food photo analysis. You can add it later in Settings.'}
          </p>
        </div>
      </div>
    </div>
  )
}
