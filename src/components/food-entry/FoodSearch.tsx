import { useState, useEffect, useCallback } from 'react'
import { useFoods } from '@/hooks/useFoods'
import { Food } from '@/types/db'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

interface FoodSearchProps {
  onSelect: (food: Food) => void
}

export function FoodSearch({ onSelect }: FoodSearchProps) {
  const { t, i18n } = useTranslation()
  const { searchFoods, loading } = useFoods()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(handler)
  }, [query])

  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchFoods(debouncedQuery).then(setResults).catch(console.error)
    } else {
      setResults([])
    }
  }, [debouncedQuery])

  const handleSelect = useCallback((food: Food) => {
    onSelect(food)
    setQuery('')
    setResults([])
  }, [onSelect])

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder={t('foodEntry.searchPlaceholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full"
      />

      {loading && query && (
        <div className="text-sm text-muted-foreground py-2">
          {t('foodEntry.loading')}
        </div>
      )}

      {results.length > 0 && (
        <Card className="p-2">
          <ul className="space-y-1">
            {results.map((food) => (
              <li key={food.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(food)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <div className="font-medium">
                    {food.name[i18n.language as 'en' | 'es']}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {food.description[i18n.language as 'en' | 'es']}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {food.calories} {t('common.calories')}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
