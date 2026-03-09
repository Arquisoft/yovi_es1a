import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import Tablero from '../components/Tablero'
import { gameService } from '../services/game.service'
import { statsService } from '../services/stats.service'
import '@testing-library/jest-dom'

vi.mock('../services/game.service')
vi.mock('../services/stats.service')
vi.mock('../idiomaConf/LanguageContext.tsx', () => ({
  useLanguage: () => ({ t: (key: string) => key === 'turn' ? 'Turno' : key })
}))

const renderTablero = (tamanoSeleccionado = 3, botSeleccionado = 'random_bot', modoSeleccionado = 'bot', colorUsuario = 'B') => {
  return render(
    <MemoryRouter initialEntries={[{ 
      pathname: '/game', 
      state: { tamanoSeleccionado, botSeleccionado, modoSeleccionado, colorUsuario } 
    }]}>
      <Routes>
        <Route path="/game" element={<Tablero />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Board - Initial Rendering', () => {
  test('renders exactly 6 cells for a board of size 3', () => {
    const { container } = renderTablero(3)
    const casillas = container.querySelectorAll('.casilla')
    expect(casillas.length).toBe(6)
  })

  test('renders exactly 15 cells for a board of size 5', () => {
    const { container } = renderTablero(5)
    const casillas = container.querySelectorAll('.casilla')
    expect(casillas.length).toBe(15)
  })

  test('initial text shows it is the PLAYER (Blue) turn', () => {
    renderTablero()
    expect(screen.getByText(/TÚ \(Azul\)/i)).toBeInTheDocument()
  })

  test('does not show the calculating message initially', () => {
    renderTablero()
    expect(screen.queryByText(/El Bot está calculando/i)).not.toBeInTheDocument()
  })

  test('uses default values (size 5) if no state is provided in the router', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero />} />
        </Routes>
      </MemoryRouter>
    )
    const casillas = document.querySelectorAll('.casilla')
    expect(casillas.length).toBe(15)
  })
})

describe('Board - Player Interaction', () => {
  beforeEach(() => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    vi.mocked(gameService.askBotMove).mockImplementation(() => new Promise(() => {}))
  })
  afterEach(() => vi.clearAllMocks())

  test('clicking an empty cell places the letter B (via class)', () => {
    const { container } = renderTablero()
    const primeraCasilla = container.querySelectorAll('.casilla')[0]
    fireEvent.click(primeraCasilla)
    expect(primeraCasilla).toHaveClass('jugador-b')
  })

  test('after clicking, the text changes to BOT (Red) turn', async () => {
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.getByText(/BOT \(Rojo\)/i)).toBeInTheDocument()
    })
  })

  test('while the bot is thinking, the "calculating" message appears', async () => {
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.getByText(/El Bot está calculando/i)).toBeInTheDocument()
    })
  })
})

describe('Board - Bot Response', () => {
  beforeEach(() => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    vi.mocked(gameService.askBotMove).mockResolvedValue({
      api_version: "1.0",
      bot_id: "test",
      game_status: 'ongoing',
      coords: { x: 1, y: 0, z: 0 }
    })
  })
  afterEach(() => vi.clearAllMocks())

  test('the bot places its token in the corresponding cell', async () => {
    const { container } = renderTablero(3)
    const casillas = container.querySelectorAll('.casilla')
    fireEvent.click(casillas[0])
    await waitFor(() => {
      const botCasilla = container.querySelector('.casilla.jugador-r')
      expect(botCasilla).toBeInTheDocument()
      expect(botCasilla).toHaveClass('jugador-r')
    })
  })

  test('the "calculating" message disappears when the bot responds', async () => {
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.queryByText(/El Bot está calculando/i)).not.toBeInTheDocument()
    })
  })

  test('the turn goes back to the PLAYER (Blue) after the bot move', async () => {
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.getByText(/TÚ \(Azul\)/i)).toBeInTheDocument()
    })
  })
})

describe('Board - End of Game', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }))
  })
  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('shows victory modal if the human won', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.getByText(/¡HAS GANADO!/i)).toBeInTheDocument()
    })
  })

  test('saves the victory statistic in the database', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(statsService.saveMatchResult).toHaveBeenCalledWith(expect.objectContaining({ result: 'win' }))
    })
  })

  test('shows defeat modal if the bot wins the game', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValueOnce({ status: 'ongoing' }).mockResolvedValueOnce({ status: 'win' })
    vi.mocked(gameService.askBotMove).mockResolvedValueOnce({
      api_version: "1.0", bot_id: "test", game_status: 'ongoing', coords: { x: 1, y: 1, z: 0 }
    })
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.getByText(/HAS PERDIDO./i)).toBeInTheDocument()
    })
  })

  test('does not save stats if userId is missing', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'JugadorFantasma' }))
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(statsService.saveMatchResult).not.toHaveBeenCalled()
    })
  })
})

describe('Board - Error Handling', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => vi.clearAllMocks())

  test('handles error if the bot crashes', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    vi.mocked(gameService.askBotMove).mockRejectedValue(new Error('Bot is down'))
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error communicating with the bot:", expect.any(Error))
    })
    expect(screen.getByText(/TÚ \(Azul\)/i)).toBeInTheDocument()
  })

  test('handles error if database fails to save stats', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    vi.mocked(statsService.saveMatchResult).mockRejectedValueOnce(new Error('DB is down'))
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error al guardar en la BD:", expect.any(Error))
    })
  })
})

describe('Board - Human vs Human Mode', () => {
  test('in human mode, both players can place pieces', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    const { container } = renderTablero(3, 'random_bot', 'humano', 'B')
    const casillas = container.querySelectorAll('.casilla')
    fireEvent.click(casillas[0])
    await waitFor(() => { expect(casillas[0]).toHaveClass('jugador-b') })
    fireEvent.click(casillas[1])
    await waitFor(() => { expect(casillas[1]).toHaveClass('jugador-r') })
  })

  test('in human mode, detects win for Player 1 (Blue)', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    const { container } = renderTablero(3, 'random_bot', 'humano', 'B')
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => { expect(screen.getByText(/¡GANÓ EL AZUL!/i)).toBeInTheDocument() })
  })
})

describe('Board - Bot Plays First', () => {
  test('bot makes first move when user chooses to play second', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    vi.mocked(gameService.askBotMove).mockResolvedValue({
      api_version: "1.0", bot_id: "test", game_status: 'ongoing', coords: { x: 0, y: 0, z: 0 }
    })
    renderTablero(3, 'random_bot', 'bot', 'R')
    await waitFor(() => {
      const botCasilla = document.querySelector('.casilla.jugador-b')
      expect(botCasilla).toBeInTheDocument()
    })
  })

  test('handles error when bot fails to make first move', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(gameService.askBotMove).mockRejectedValue(new Error('Bot error'))
    renderTablero(3, 'random_bot', 'bot', 'R')
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error en el primer movimiento del bot:", expect.any(Error))
    })
  })
})

describe('Board - Additional Scenarios', () => {
  test('handles error when verifying bot victory', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(gameService.checkWinner).mockResolvedValueOnce({ status: 'ongoing' }).mockRejectedValueOnce(new Error('Check error'))
    vi.mocked(gameService.askBotMove).mockResolvedValue({
      api_version: "1.0", bot_id: "test", game_status: 'ongoing', coords: { x: 1, y: 0, z: 0 }
    })
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error verificando victoria del bot:", expect.any(Error))
    })
  })

  test('board cells start empty', () => {
    const { container } = renderTablero(3)
    const casillas = container.querySelectorAll('.casilla')
    casillas.forEach(c => {
      expect(c).not.toHaveClass('jugador-b')
      expect(c).not.toHaveClass('jugador-r')
    })
  })
})
