// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi, afterEach } from 'vitest'
import GameSettings from '../pages/GameSettings'
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom'
import { useMultiplayer } from '../hooks/useMultiplayer'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../hooks/useMultiplayer', () => ({
  useMultiplayer: vi.fn(() => ({
    isConnected: false,
    roomCode: null,
    errorMsg: '',
    gameStarted: false,
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    lastOpponentMove: null,
    sendMove: vi.fn(),
    myColor: null,
    opponentName: '',
    boardSize: 5,
    leaveMatchGracefully: vi.fn()
  }))
}))

vi.mock('../idiomaConf/LanguageContext.tsx', () => ({
  useLanguage: () => ({ t: (key: string) => key })
}))

vi.mock('../components/Tablero', () => ({
  default: vi.fn(({ onSendMove }) => (
    <button 
      data-testid="mock-tablero-btn" 
      onClick={() => onSendMove && onSendMove('nuevo_layout_123')}
    >
      Mock Tablero
    </button>
  ))
}))

describe('GameSettings', () => {
  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('updates board size using the offline slider', () => {
    render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '7' } })
    expect(slider).toHaveValue('7')
  })

  test('selects a specific bot from the opponent dropdown', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const botSelector = container.querySelector('.offline-options-area .control-group:nth-child(3) select') as HTMLSelectElement
    
    await user.selectOptions(botSelector, 'simple_blocker_bot')
    expect(botSelector).toHaveValue('simple_blocker_bot')
  })

  test('renders the correct number of preview cells for size 4', () => {
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '4' } })
    
    const drawnBoxes = container.querySelectorAll('.casilla-mini')
    expect(drawnBoxes.length).toBe(10)
  })

  test('renders the correct number of preview cells for size 12', () => {
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '12' } })
    
    const drawnBoxes = container.querySelectorAll('.casilla-mini')
    expect(drawnBoxes.length).toBe(78)
  })

  test('changes the game difficulty and updates the selected bot accordingly', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)
    
    const difficultySelect = container.querySelector('.offline-options-area .control-group:nth-child(2) select') as HTMLSelectElement
    const botSelect = container.querySelector('.offline-options-area .control-group:nth-child(3) select') as HTMLSelectElement

    await user.selectOptions(difficultySelect, 'medio')
    expect(difficultySelect).toHaveValue('medio')

    await user.selectOptions(botSelect, 'priority_block_bot')
    expect(botSelect).toHaveValue('priority_block_bot')
  })

  test('navigates to the game screen with the correct configuration parameters', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)

    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '10' } })

    const difficultySelect = container.querySelector('.offline-options-area .control-group:nth-child(2) select') as HTMLSelectElement
    const botSelect = container.querySelector('.offline-options-area .control-group:nth-child(3) select') as HTMLSelectElement
    
    await user.selectOptions(difficultySelect, 'dificil')
    await user.selectOptions(botSelect, 'monte_carlo_bot')

    const playButton = container.querySelector('.btn-jugar-fixed') as HTMLElement
    await user.click(playButton)

    expect(mockNavigate).toHaveBeenCalledWith('/game', expect.objectContaining({
      state: expect.objectContaining({
        tamanoSeleccionado: 10,
        botSeleccionado: 'monte_carlo_bot'
      })
    }))
  })

  test('switches between available game modes successfully', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)

    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    expect(modeSelector).toHaveValue('bot')

    await user.selectOptions(modeSelector, 'humano')
    expect(modeSelector).toHaveValue('humano')

    await user.selectOptions(modeSelector, 'online')
    expect(modeSelector).toHaveValue('online')
  })

  test('reverts to the default bot when difficulty is changed back to easy', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)

    const difficultySelect = container.querySelector('.offline-options-area .control-group:nth-child(2) select') as HTMLSelectElement
    const botSelect = container.querySelector('.offline-options-area .control-group:nth-child(3) select') as HTMLSelectElement

    await user.selectOptions(difficultySelect, 'medio')
    await user.selectOptions(difficultySelect, 'facil')
    expect(botSelect).toHaveValue('random_bot')
  })

  test('allows the user to change the starting player color', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)

    const colorSelector = container.querySelector('.offline-options-area .control-group:nth-child(4) select') as HTMLSelectElement
    await user.selectOptions(colorSelector, 'R')
    expect(colorSelector).toHaveValue('R')
  })

  test('handles invalid text input and extreme limits for the offline board size', () => {
    render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const sizeInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement

    fireEvent.change(sizeInput, { target: { value: 'invalid' } })
    expect(sizeInput.value).toBe('')

    fireEvent.change(sizeInput, { target: { value: '99' } })
    expect(sizeInput.value).toBe('50')

    fireEvent.change(sizeInput, { target: { value: '1' } })
    fireEvent.blur(sizeInput)
    expect(sizeInput.value).toBe('3')
  })

  test('maintains the current board size on blur if the value is already valid', () => {
    render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const sizeInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement

    fireEvent.change(sizeInput, { target: { value: '8' } })
    fireEvent.blur(sizeInput)
    expect(sizeInput.value).toBe('8')
  })

  test('displays a warning message when the board size exceeds the preview limit', () => {
    render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const sizeInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement
    
    fireEvent.change(sizeInput, { target: { value: '25' } })
    expect(screen.getByText('prevLim')).toBeInTheDocument()
  })
})

describe('GameSettings - Online Mode', () => {
  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('displays the online lobby interface when online mode is selected', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)

    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    await user.selectOptions(modeSelector, 'online')

    expect(screen.getByText(/serverCon|serverNo/i)).toBeInTheDocument()
  })

  test('updates join room code input and calls joinRoom function when button is clicked', async () => {
    const user = userEvent.setup()
    const joinRoomMock = vi.fn()
    vi.mocked(useMultiplayer).mockReturnValue({
      isConnected: true, roomCode: null, errorMsg: '', gameStarted: false,
      createRoom: vi.fn(), joinRoom: joinRoomMock, lastOpponentMove: null,
      sendMove: vi.fn(), myColor: null, opponentName: '', boardSize: 5, leaveMatchGracefully: vi.fn(),notifyGameOver: vi.fn(),
    })

    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)

    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    await user.selectOptions(modeSelector, 'online')

    const codeInput = container.querySelector('input[placeholder="code"]') as HTMLInputElement
    fireEvent.change(codeInput, { target: { value: 'room99' } })
    
    // Verificamos que el estado local (joinCodeInput) se ha actualizado (Línea 130)
    expect(codeInput.value).toBe('room99')

    const joinButton = screen.getByText('uni')
    await user.click(joinButton)

    expect(joinRoomMock).toHaveBeenCalledWith('room99', expect.any(String))
  })

  test('updates board size using the online slider and handles numeric input limits', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)

    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    await user.selectOptions(modeSelector, 'online')

    const slider = screen.getByRole('slider') as HTMLInputElement
    fireEvent.change(slider, { target: { value: '15' } })
    expect(slider.value).toBe('15')

    const sizeInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement
    fireEvent.change(sizeInput, { target: { value: 'invalid' } })
    expect(sizeInput.value).toBe('')

    fireEvent.change(sizeInput, { target: { value: '60' } })
    expect(sizeInput.value).toBe('50')

    fireEvent.change(sizeInput, { target: { value: '2' } })
    fireEvent.blur(sizeInput)
    expect(sizeInput.value).toBe('3')
  })

  test('visually caps the online slider at 30 even if numeric input exceeds it', async () => {
    const user = userEvent.setup()
    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)

    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    await user.selectOptions(modeSelector, 'online')

    const sizeInput = screen.getAllByRole('spinbutton')[0] as HTMLInputElement
    const slider = screen.getByRole('slider') as HTMLInputElement

    fireEvent.change(sizeInput, { target: { value: '45' } })
    expect(slider.value).toBe('30')
  })

  test('renders the live online board when the game has started', async () => {
    vi.mocked(useMultiplayer).mockReturnValue({
      isConnected: true, roomCode: 'ROOM123', errorMsg: '', gameStarted: true,
      createRoom: vi.fn(), joinRoom: vi.fn(), lastOpponentMove: null,
      sendMove: vi.fn(), myColor: 'B', opponentName: 'Rival', boardSize: 5, leaveMatchGracefully: vi.fn(),notifyGameOver: vi.fn(),
    })

    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    await userEvent.setup().selectOptions(modeSelector, 'online')

    await waitFor(() => {
      expect(screen.getByText(/Partida 1vs1 Online/i)).toBeInTheDocument()
    })
  })

  test('displays the waiting screen with the room code before opponent joins', async () => {
    vi.mocked(useMultiplayer).mockReturnValue({
      isConnected: true, roomCode: 'WAIT99', errorMsg: '', gameStarted: false,
      createRoom: vi.fn(), joinRoom: vi.fn(), lastOpponentMove: null,
      sendMove: vi.fn(), myColor: null, opponentName: '', boardSize: 5, leaveMatchGracefully: vi.fn(),notifyGameOver: vi.fn(),
    })

    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    await userEvent.setup().selectOptions(modeSelector, 'online')

    await waitFor(() => {
      expect(screen.getByText('WAIT99')).toBeInTheDocument()
    })
  })

  test('triggers the move sending logic correctly from the online board component', async () => {
    const user = userEvent.setup()
    const sendMoveMock = vi.fn()
    
    vi.mocked(useMultiplayer).mockReturnValue({
      isConnected: true, roomCode: 'ROOM123', errorMsg: '', gameStarted: true,
      createRoom: vi.fn(), joinRoom: vi.fn(), lastOpponentMove: null,
      sendMove: sendMoveMock, myColor: 'B', opponentName: 'Rival', boardSize: 5, leaveMatchGracefully: vi.fn(),notifyGameOver: vi.fn(),
    })

    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    await user.selectOptions(modeSelector, 'online')

    const mockTableroBtn = await screen.findByTestId('mock-tablero-btn')
    fireEvent.click(mockTableroBtn)

    expect(sendMoveMock).toHaveBeenCalledWith('ROOM123', 'nuevo_layout_123')
  })

  test('clicking the create room button invokes the createRoom function with current state', async () => {
    const user = userEvent.setup()
    const createRoomMock = vi.fn()
    
    vi.mocked(useMultiplayer).mockReturnValue({
      isConnected: true, roomCode: null, errorMsg: '', gameStarted: false,
      createRoom: createRoomMock, joinRoom: vi.fn(), lastOpponentMove: null,
      sendMove: vi.fn(), myColor: null, opponentName: '', boardSize: 5, leaveMatchGracefully: vi.fn(),notifyGameOver: vi.fn(),
    })

    localStorage.setItem('user', JSON.stringify({ username: 'PlayerX' }))

    const { container } = render(<MemoryRouter><GameSettings /></MemoryRouter>)
    const modeSelector = container.querySelector('.config-controls .control-group select') as HTMLSelectElement
    await user.selectOptions(modeSelector, 'online')

    const createBtn = screen.getByText('crearSala')
    await user.click(createBtn)
    
    expect(createRoomMock).toHaveBeenCalledWith('PlayerX', 5)
  })
})