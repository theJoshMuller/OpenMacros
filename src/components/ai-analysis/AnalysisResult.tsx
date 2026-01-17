import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Food } from '@/types/db'
import { db } from '@/lib/db/schema'
import { generateUUID, generateDeviceId } from '@/lib/utils/uuid'

export interface AnalysisResultData {
  name: string
  description: string
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
}

export interface AnalysisResultProps {
  initialData: AnalysisResultData
  onSave: (data: AnalysisResultData) => void
  onAddToLog: (data: {
    foodId: string
    quantity: number
    calories: number
    protein: number
    carbs: number
    fat: number
  }) => void
}

export function AnalysisResult({ initialData, onSave, onAddToLog }: AnalysisResultProps) {
  const { t } = useTranslation()
  const [data, setData] = useState<AnalysisResultData>(initialData)

  const handleChange = (field: keyof AnalysisResultData, value: string | number) => {
    setData((prev) => ({
      ...prev,
      [field]: typeof value === 'string' && ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'servingSize'].includes(field) 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handleSaveToLibrary = async () => {
    const deviceId = generateDeviceId()
    const now = Date.now()

    const food: Omit<Food, 'id'> = {
      name: { en: data.name, es: data.name },
      description: { en: data.description, es: data.description },
      servingSize: data.servingSize,
      servingUnit: { en: data.servingUnit, es: data.servingUnit },
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      sugar: data.sugar,
      deviceId,
      createdAt: now,
      updatedAt: now
    }

    const id = generateUUID()
    await db.foods.add({ ...food, id })
    onSave(data)
  }

  const handleAddToLog = async () => {
    const deviceId = generateDeviceId()
    const now = Date.now()

    const food: Omit<Food, 'id'> = {
      name: { en: data.name, es: data.name },
      description: { en: data.description, es: data.description },
      servingSize: data.servingSize,
      servingUnit: { en: data.servingUnit, es: data.servingUnit },
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      sugar: data.sugar,
      deviceId,
      createdAt: now,
      updatedAt: now
    }

    const id = generateUUID()
    await db.foods.add({ ...food, id })

    onAddToLog({
      foodId: id,
      quantity: data.servingSize,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fat: data.fat
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('aiAnalysis.result')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            {t('common.name')}
          </label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            {t('common.description')}
          </label>
          <Input
            id="description"
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="servingSize" className="text-sm font-medium">
              {t('common.serving')}
            </label>
            <Input
              id="servingSize"
              type="number"
              step="0.1"
              value={data.servingSize}
              onChange={(e) => handleChange('servingSize', e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="servingUnit" className="text-sm font-medium">
              {t('common.grams')}
            </label>
            <Input
              id="servingUnit"
              value={data.servingUnit}
              onChange={(e) => handleChange('servingUnit', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t">
          <h4 className="text-sm font-semibold">{t('foodEntry.nutritionInfo')}</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="calories" className="text-xs text-muted-foreground">
                {t('common.calories')}
              </label>
              <Input
                id="calories"
                type="number"
                step="1"
                value={data.calories}
                onChange={(e) => handleChange('calories', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="protein" className="text-xs text-muted-foreground">
                {t('common.protein')}
              </label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                value={data.protein}
                onChange={(e) => handleChange('protein', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="carbs" className="text-xs text-muted-foreground">
                {t('common.carbs')}
              </label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                value={data.carbs}
                onChange={(e) => handleChange('carbs', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="fat" className="text-xs text-muted-foreground">
                {t('common.fat')}
              </label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                value={data.fat}
                onChange={(e) => handleChange('fat', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="fiber" className="text-xs text-muted-foreground">
                {t('common.fiber')}
              </label>
              <Input
                id="fiber"
                type="number"
                step="0.1"
                value={data.fiber || ''}
                onChange={(e) => handleChange('fiber', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sugar" className="text-xs text-muted-foreground">
                {t('common.sugar')}
              </label>
              <Input
                id="sugar"
                type="number"
                step="0.1"
                value={data.sugar || ''}
                onChange={(e) => handleChange('sugar', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleSaveToLibrary} className="w-full" variant="outline">
          {t('aiAnalysis.saveToLibrary')}
        </Button>
        <Button onClick={handleAddToLog} className="w-full">
          {t('aiAnalysis.addToLog')}
        </Button>
      </CardFooter>
    </Card>
  )
}
