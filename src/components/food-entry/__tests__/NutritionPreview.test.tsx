import { render, screen } from '@testing-library/react'
import { NutritionPreview } from '../NutritionPreview'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

describe('NutritionPreview', () => {
  it('renders nutrition information for a food item', () => {
    const nutrition = {
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14
    }

    render(<NutritionPreview nutrition={nutrition} />)

    expect(screen.getByText('nutrition.calories')).toBeInTheDocument()
    expect(screen.getByText('105')).toBeInTheDocument()
    expect(screen.getByText('nutrition.protein')).toBeInTheDocument()
    expect(screen.getByText('1.3g')).toBeInTheDocument()
    expect(screen.getByText('nutrition.carbs')).toBeInTheDocument()
    expect(screen.getByText('27g')).toBeInTheDocument()
    expect(screen.getByText('nutrition.fat')).toBeInTheDocument()
    expect(screen.getByText('0.4g')).toBeInTheDocument()
  })

  it('renders without fiber and sugar when not provided', () => {
    const nutrition = {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6
    }

    render(<NutritionPreview nutrition={nutrition} />)

    expect(screen.getByText('nutrition.calories')).toBeInTheDocument()
    expect(screen.getByText('165')).toBeInTheDocument()
    expect(screen.getByText('nutrition.protein')).toBeInTheDocument()
    expect(screen.getByText('31g')).toBeInTheDocument()
    expect(screen.getByText('nutrition.carbs')).toBeInTheDocument()
    expect(screen.getByText('0g')).toBeInTheDocument()
    expect(screen.getByText('nutrition.fat')).toBeInTheDocument()
    expect(screen.getByText('3.6g')).toBeInTheDocument()

    expect(screen.queryByText('nutrition.fiber')).not.toBeInTheDocument()
    expect(screen.queryByText('nutrition.sugar')).not.toBeInTheDocument()
  })

  it('displays fiber and sugar when provided', () => {
    const nutrition = {
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14
    }

    render(<NutritionPreview nutrition={nutrition} />)

    expect(screen.getByText('nutrition.fiber')).toBeInTheDocument()
    expect(screen.getByText('3.1g')).toBeInTheDocument()
    expect(screen.getByText('nutrition.sugar')).toBeInTheDocument()
    expect(screen.getByText('14g')).toBeInTheDocument()
  })
})
