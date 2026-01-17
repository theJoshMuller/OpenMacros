import { render, screen, fireEvent } from '@testing-library/react'
import { ManualFoodEntry } from '../ManualFoodEntry'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

describe('ManualFoodEntry', () => {
  const mockFood = {
    id: '1',
    name: { en: 'Banana', es: 'Plátano' },
    description: { en: 'Fresh yellow banana', es: 'Plátano fresco amarillo' },
    servingSize: 1,
    servingUnit: { en: 'medium', es: 'mediano' },
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    fiber: 3.1,
    sugar: 14,
    deviceId: 'device-1',
    createdAt: 1234567890,
    updatedAt: 1234567890
  }

  it('renders food information when food is selected', () => {
    const onAdd = jest.fn()
    render(<ManualFoodEntry selectedFood={mockFood} onAdd={onAdd} />)

    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('foodEntry.servingSize')).toBeInTheDocument()
  })

  it('displays placeholder when no food is selected', () => {
    const onAdd = jest.fn()
    render(<ManualFoodEntry selectedFood={null} onAdd={onAdd} />)

    expect(screen.getByText('foodEntry.selectFood')).toBeInTheDocument()
  })

  it('allows editing serving size', () => {
    const onAdd = jest.fn()
    render(<ManualFoodEntry selectedFood={mockFood} onAdd={onAdd} />)

    const input = screen.getByRole('spinbutton')
    expect(input).toHaveValue(1)

    fireEvent.change(input, { target: { value: '2' } })
    expect(input).toHaveValue(2)
  })

  it('calculates nutrition based on serving size', () => {
    const onAdd = jest.fn()
    render(<ManualFoodEntry selectedFood={mockFood} onAdd={onAdd} />)

    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '2' } })

    expect(screen.getByText('210')).toBeInTheDocument()
  })

  it('calls onAdd with correct data when button is clicked', () => {
    const onAdd = jest.fn()
    render(<ManualFoodEntry selectedFood={mockFood} onAdd={onAdd} />)

    const button = screen.getByText('foodEntry.addToLog')
    fireEvent.click(button)

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        foodId: '1',
        quantity: 1,
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fat: 0.4
      })
    )
  })

  it('does not render add button when no food is selected', () => {
    const onAdd = jest.fn()
    render(<ManualFoodEntry selectedFood={null} onAdd={onAdd} />)

    expect(screen.queryByText('foodEntry.addToLog')).not.toBeInTheDocument()
  })
})
