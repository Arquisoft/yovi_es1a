import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi, afterEach } from 'vitest'
import GameSettings from '../pages/GameSettings'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('GameSettings', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('It allows the user to choose a board size by sliding the control', () => {
    render(<GameSettings />)
    
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '7' } })

    const labelStrong = screen.getByText(/tamTabl/i)

    expect(labelStrong.closest('label')).toHaveTextContent('7')
  })

  test('allows you to choose a rival bot in the opponent selector', async () => {
    const user = userEvent.setup()
    render(<GameSettings />)

    const selectors = screen.getAllByRole('combobox')
    const botSelector = selectors[3] 

    await user.selectOptions(botSelector, 'simple_blocker_bot')
    expect(botSelector).toHaveValue('simple_blocker_bot')
  })

  test('The preview draws exactly the boxes corresponding to size 4', () => {
    const { container } = render(<GameSettings />)
    
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '4' } })

    const drawnBoxes = container.querySelectorAll('.casilla-mini')
    expect(drawnBoxes.length).toBe(10)
  })

  test('The preview draws exactly the boxes corresponding to size 12', () => {
    const { container } = render(<GameSettings />)
    
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '12' } })

    const drawnBoxes = container.querySelectorAll('.casilla-mini')
    expect(drawnBoxes.length).toBe(78)
  })

  test('It allows you to change the difficulty and then select a specific bot', async () => {
    const user = userEvent.setup()
    render(<GameSettings />)

    const selectors = screen.getAllByRole('combobox')
    const dificultySelector = selectors[2]
    const botSelector = selectors[3]

    await user.selectOptions(dificultySelector, 'medio')
    expect(dificultySelector).toHaveValue('medio')

    await user.selectOptions(botSelector, 'priority_block_bot')
    expect(botSelector).toHaveValue('priority_block_bot')
  })

  test('When you press play, it sends the navigation command with the exact settings', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <GameSettings />
      </MemoryRouter>
    )

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '10' } })

    const selectors = screen.getAllByRole('combobox')
    await user.selectOptions(selectors[2], 'dificil')
    await user.selectOptions(selectors[3], 'monte_carlo_bot')

    const playButton = screen.getAllByRole('button', { name: /JUGAR/i })
    await user.click(playButton[1])

    expect(mockNavigate).toHaveBeenCalledWith('/game', expect.objectContaining({
      state: expect.objectContaining({
        tamanoSeleccionado: 10,
        botSeleccionado: 'monte_carlo_bot'
      })
    }))
  })

  test('It allows the user to change the game mode (bot or humano)', async () => {
    const user = userEvent.setup()
    render(<GameSettings />)

    const selectors = screen.getAllByRole('combobox')
    
    const modeSelector = selectors[1]
    expect(modeSelector).toHaveValue('bot')
    await user.selectOptions(modeSelector, 'humano')
    expect(modeSelector).toHaveValue('humano')

    await user.selectOptions(modeSelector, 'bot')
    expect(modeSelector).toHaveValue('bot')
  })

  test('It automatically selects "random_bot" when difficulty is set to easy', async () => {
    const user = userEvent.setup()
    render(<GameSettings />)

    const selectors = screen.getAllByRole('combobox')
    const dificultySelector = selectors[2]
    const botSelector = selectors[3]

    await user.selectOptions(dificultySelector, 'medio')
    await user.selectOptions(botSelector, 'priority_block_bot')

    await user.selectOptions(dificultySelector, 'facil')
    expect(botSelector).toHaveValue('random_bot')
  })
})