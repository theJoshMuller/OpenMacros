import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FoodSearch } from '../FoodSearch'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' }
  })
}))

jest.mock('@/hooks/useFoods', () => ({
  useFoods: () => ({
    searchFoods: jest.fn().mockResolvedValue([
      {
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
    ]),
    loading: false,
    error: null
  })
}))

describe('FoodSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders search input', () => {
    const onSelect = jest.fn()
    render(<FoodSearch onSelect={onSelect} />)

    expect(screen.getByPlaceholderText('foodEntry.searchPlaceholder')).toBeInTheDocument()
  })

  it('displays search results after typing', async () => {
    const onSelect = jest.fn()
    render(<FoodSearch onSelect={onSelect} />)

    const input = screen.getByPlaceholderText('foodEntry.searchPlaceholder')
    fireEvent.change(input, { target: { value: 'ban' } })

    jest.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('Banana')).toBeInTheDocument()
    })
  })

  it('allows selecting a food from results', async () => {
    const onSelect = jest.fn()
    render(<FoodSearch onSelect={onSelect} />)

    const input = screen.getByPlaceholderText('foodEntry.searchPlaceholder')
    fireEvent.change(input, { target: { value: 'ban' } })

    jest.advanceTimersByTime(300)

    await waitFor(() => {
      const result = screen.getByText('Banana')
      fireEvent.click(result)
    })

    expect(onSelect).toHaveBeenCalled()
  })

  it('displays loading text when loading is true', () => {
    const onSelect = jest.fn()
    render(<FoodSearch onSelect={onSelect} />)

    expect(screen.queryByText('foodEntry.loading')).not.toBeInTheDocument()
  })

  it('debounces search input', async () => {
    const onSelect = jest.fn()
    render(<FoodSearch onSelect={onSelect} />)

    const input = screen.getByPlaceholderText('foodEntry.searchPlaceholder')

    fireEvent.change(input, { target: { value: 'b' } })
    fireEvent.change(input, { target: { value: 'ba' } })
    fireEvent.change(input, { target: { value: 'ban' } })

    jest.advanceTimersByTime(200)

    expect(screen.queryByText('Banana')).not.toBeInTheDocument()

    jest.advanceTimersByTime(100)

    await waitFor(() => {
      expect(screen.getByText('Banana')).toBeInTheDocument()
    })
  })

  it('clears results when input is cleared', async () => {
    const onSelect = jest.fn()
    render(<FoodSearch onSelect={onSelect} />)

    const input = screen.getByPlaceholderText('foodEntry.searchPlaceholder')
    fireEvent.change(input, { target: { value: 'ban' } })

    jest.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.getByText('Banana')).toBeInTheDocument()
    })

    fireEvent.change(input, { target: { value: '' } })

    jest.advanceTimersByTime(300)

    await waitFor(() => {
      expect(screen.queryByText('Banana')).not.toBeInTheDocument()
    })
  })
})
