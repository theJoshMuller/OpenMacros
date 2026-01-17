'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface OnboardingWizardProps {
  children: React.ReactNode
  totalSteps: number
  onComplete: () => void
  onCancel: () => void
  initialStep?: number
}

interface OnboardingContextValue {
  currentStep: number
  totalSteps: number
  next: () => void
  previous: () => void
  goTo: (step: number) => void
  isFirstStep: boolean
  isLastStep: boolean
  registerValidate: (stepIndex: number, validateFn: () => boolean) => void
  unregisterValidate: (stepIndex: number) => void
}

const OnboardingContext = React.createContext<OnboardingContextValue | null>(null)

function useOnboarding() {
  const context = React.useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingWizard')
  }
  return context
}

function OnboardingWizard({
  children,
  totalSteps,
  onComplete,
  onCancel,
  initialStep = 0
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(initialStep)
  const steps = React.Children.toArray(children)

  if (totalSteps !== steps.length) {
    throw new Error(`totalSteps (${totalSteps}) must match the number of children (${steps.length})`)
  }

  const stepValidateFunctions = React.useRef<Map<number, () => boolean>>(new Map())

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  const validateCurrentStep = (): boolean => {
    const validateFn = stepValidateFunctions.current.get(currentStep)
    return validateFn ? validateFn() : true
  }

  const next = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        onComplete()
      } else {
        setCurrentStep((prev) => prev + 1)
      }
    }
  }

  const previous = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const goTo = (step: number) => {
    if (validateCurrentStep() && step >= 0 && step < totalSteps && step < steps.length) {
      setCurrentStep(step)
    }
  }

  const registerValidate = (stepIndex: number, validateFn: () => boolean) => {
    stepValidateFunctions.current.set(stepIndex, validateFn)
  }

  const unregisterValidate = (stepIndex: number) => {
    stepValidateFunctions.current.delete(stepIndex)
  }

  const contextValue: OnboardingContextValue = {
    currentStep,
    totalSteps,
    next,
    previous,
    goTo,
    isFirstStep,
    isLastStep,
    registerValidate,
    unregisterValidate
  }

  const currentStepNode = steps[currentStep] as React.ReactElement

  return (
    <OnboardingContext.Provider value={contextValue}>
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              {onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
            <div
              className="h-2 w-full bg-muted rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={currentStep + 1}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
            >
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <div data-step={currentStep}>
            {currentStepNode}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={previous}
            disabled={isFirstStep}
          >
            Back
          </Button>
          <Button
            onClick={next}
            className="min-w-[100px]"
          >
            {isLastStep ? 'Complete' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </OnboardingContext.Provider>
  )
}

export { OnboardingWizard, useOnboarding }
export type { OnboardingWizardProps }
