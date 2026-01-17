'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { FoodSearch } from '@/components/food-entry/FoodSearch'
import { ManualFoodEntry } from '@/components/food-entry/ManualFoodEntry'
import { useFoods } from '@/hooks/useFoods'
import type { Food } from '@/types/db'

export default function FoodEntryPage() {
  const router = useRouter()
  const { searchFoods, createFood } = useFoods()
  const [selectedFood, setSelectedFood] = React.useState<Food | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleFoodSelect = async (food: Food) => {
    setLoading(true)
    setError(null)

    try {
      setSelectedFood(food)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load food'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToLibrary = async () => {
    if (!selectedFood) return

    setLoading(true)
    setError(null)

    try {
      await createFood(selectedFood)
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save food'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Add Food to Log</h1>
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 text-red-800 text-sm">
            {error}
          </div>
        )}

        {!selectedFood ? (
          <FoodSearch
            onFoodSelect={handleFoodSelect}
            loading={loading}
          />
        ) : (
          <ManualFoodEntry
            food={selectedFood}
            onSave={handleSaveToLibrary}
            onCancel={() => setSelectedFood(null)}
          />
        )}
      </div>
    </div>
  )
}
