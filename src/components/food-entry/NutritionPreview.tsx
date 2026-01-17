import { NutritionValues } from '@/lib/utils/nutrition'
import { useTranslation } from 'react-i18next'

interface NutritionPreviewProps {
  nutrition: NutritionValues
}

export function NutritionPreview({ nutrition }: NutritionPreviewProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('nutrition.calories')}</span>
        <span className="font-medium">{nutrition.calories}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('nutrition.protein')}</span>
        <span className="font-medium">{nutrition.protein}g</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('nutrition.carbs')}</span>
        <span className="font-medium">{nutrition.carbs}g</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t('nutrition.fat')}</span>
        <span className="font-medium">{nutrition.fat}g</span>
      </div>
      {nutrition.fiber !== undefined && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('nutrition.fiber')}</span>
          <span className="font-medium">{nutrition.fiber}g</span>
        </div>
      )}
      {nutrition.sugar !== undefined && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t('nutrition.sugar')}</span>
          <span className="font-medium">{nutrition.sugar}g</span>
        </div>
      )}
    </div>
  )
}
