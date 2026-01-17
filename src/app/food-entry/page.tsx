'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { FoodSearch } from '@/components/food-entry/FoodSearch'
import { ManualFoodEntry } from '@/components/food-entry/ManualFoodEntry'
import { useDailyLog } from '@/hooks/useDailyLog'
import type { Food } from '@/types/db'

export default function FoodEntryPage() {
  const router = useRouter()
  const { addEntry } = useDailyLog()
  const [selectedFood, setSelectedFood] = React.useState<Food | null>(null)

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food)
  }

  const handleAdd = async (entry: {
    foodId: string
    quantity: number
    calories: number
    protein: number
    carbs: number
    fat: number
  }) => {
    try {
      const today = new Date().toISOString().split('T')[0]

      await addEntry(today, {
        type: 'food',
        itemId: entry.foodId,
        quantity: entry.quantity,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
      })

      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to add to log:', err)
    }
  }

  const handleCancel = () => {
    if (selectedFood) {
      setSelectedFood(null)
    } else {
      router.push('/dashboard')
    }
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

        {!selectedFood ? (
          <FoodSearch
            onSelect={handleFoodSelect}
          />
        ) : (
          <ManualFoodEntry
            selectedFood={selectedFood}
            onAdd={handleAdd}
          />
        )}
      </div>
    </div>
  )
}
