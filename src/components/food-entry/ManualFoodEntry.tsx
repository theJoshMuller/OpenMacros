import { useState, useEffect } from 'react'
import { Food } from '@/types/db'
import { NutritionValues } from '@/lib/utils/nutrition'
import { calculateNutrition } from '@/lib/utils/nutrition'
import { NutritionPreview } from './NutritionPreview'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ManualFoodEntryProps {
  selectedFood: Food | null
  onAdd: (entry: {
    foodId: string
    quantity: number
    calories: number
    protein: number
    carbs: number
    fat: number
  }) => void
}

export function ManualFoodEntry({ selectedFood, onAdd }: ManualFoodEntryProps) {
  const { t, i18n } = useTranslation()
  const [quantity, setQuantity] = useState<number>(1)
  const [calculatedNutrition, setCalculatedNutrition] = useState<NutritionValues | null>(null)

  useEffect(() => {
    if (selectedFood) {
      const baseNutrition: NutritionValues = {
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber,
        sugar: selectedFood.sugar
      }
      setCalculatedNutrition(
        calculateNutrition(baseNutrition, quantity, selectedFood.servingSize)
      )
    }
  }, [selectedFood, quantity])

  const handleAdd = () => {
    if (!selectedFood || !calculatedNutrition) return

    onAdd({
      foodId: selectedFood.id,
      quantity,
      calories: calculatedNutrition.calories,
      protein: calculatedNutrition.protein,
      carbs: calculatedNutrition.carbs,
      fat: calculatedNutrition.fat
    })

    setQuantity(1)
  }

  if (!selectedFood) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        {t('foodEntry.selectFood')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{selectedFood.name[i18n.language as 'en' | 'es']}</h3>
        <p className="text-sm text-muted-foreground">
          {selectedFood.description[i18n.language as 'en' | 'es']}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="quantity" className="text-sm font-medium">
          {t('foodEntry.servingSize')}
        </label>
        <Input
          id="quantity"
          type="number"
          min="0.1"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          {t('foodEntry.baseServing')}: {selectedFood.servingSize} {selectedFood.servingUnit[i18n.language as 'en' | 'es']}
        </p>
      </div>

      {calculatedNutrition && <NutritionPreview nutrition={calculatedNutrition} />}

      <Button onClick={handleAdd} className="w-full">
        {t('foodEntry.addToLog')}
      </Button>
    </div>
  )
}
