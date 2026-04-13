// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import Tablero from '../components/Tablero'
import { gameService } from '../services/game.service'
import { statsService } from '../services/stats.service'
import '@testing-library/jest-dom/vitest';

vi.mock('../services/game.service')
vi.mock('../services/stats.service')
vi.mock('../idiomaConf/LanguageContext.tsx', () => ({
  useLanguage: () => ({ t: (key: string) => key === 'turn' ? 'Turno' : key })
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

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
    expect(screen.getAllByText(/TÚ \(Azul\)/i)[0]).toBeInTheDocument()
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
  afterEach(() => { cleanup(); vi.clearAllMocks(); })

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
      expect(screen.getAllByText(/BOT \(Rojo\)/i)[0]).toBeInTheDocument()
    })
  })

  test('while the bot is thinking, the "calculating" message appears', async () => {
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.getAllByText(/botCalc/i)[0]).toBeInTheDocument()
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
  afterEach(() => { cleanup(); vi.clearAllMocks(); })

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
      expect(screen.getAllByText(/TÚ \(Azul\)/i)[0]).toBeInTheDocument()
    })
  })
})

describe('Board - End of Game', () => {
  beforeEach(() => {
    sessionStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }))
  })
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  test('shows victory modal if the human won', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.getAllByText(/¡HAS GANADO!/i)[0]).toBeInTheDocument()
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
      expect(screen.getAllByText(/HAS PERDIDO/i)[0]).toBeInTheDocument()
    })
  })

  test('does not save stats if userId is missing', async () => {
    sessionStorage.setItem('user', JSON.stringify({ username: 'JugadorFantasma' }))
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(statsService.saveMatchResult).not.toHaveBeenCalled()
    })
  })

  test('in human mode, saves lose stats for the losing player', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }))
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    const { container } = renderTablero(3, 'random_bot', 'humano', 'R')
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(statsService.saveMatchResult).toHaveBeenCalledWith(
        expect.objectContaining({ result: 'lose' })
      )
    })
  })

  test('bot first move: shows defeat if bot wins on first move', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    vi.mocked(gameService.askBotMove).mockResolvedValue({
      api_version: '1.0', bot_id: 'test', game_status: 'ongoing',
      coords: { x: 0, y: 0, z: 0 }
    })
    sessionStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }))
    renderTablero(3, 'random_bot', 'bot', 'R')
    await waitFor(() => {
      expect(screen.getAllByText(/HAS PERDIDO/i)[0]).toBeInTheDocument()
    })
  })
})

describe('Board - Error Handling', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => { cleanup(); vi.clearAllMocks(); })

  test('handles error if the bot crashes', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    vi.mocked(gameService.askBotMove).mockRejectedValue(new Error('Bot is down'))
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith("Error communicating with the bot:", expect.any(Error))
    })
    expect(screen.getAllByText(/TÚ \(Azul\)/i)[0]).toBeInTheDocument()
  })

  test('handles error if database fails to save stats', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: '123' }));
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
  afterEach(() => { cleanup(); vi.clearAllMocks(); })

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
    await waitFor(() => { expect(screen.getAllByText(/¡GANÓ EL AZUL!/i)[0]).toBeInTheDocument() })
  })
})

describe('Board - Bot Plays First', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); })

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
  afterEach(() => { cleanup(); vi.clearAllMocks(); })

  test('handles error when verifying bot victory', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(gameService.checkWinner).mockResolvedValueOnce({ status: 'ongoing' }).mockRejectedValueOnce(new Error('Check error'))
    vi.mocked(gameService.askBotMove).mockResolvedValue({
      api_version: "1.0", bot_id: "test", game_status: 'ongoing', coords: { x: 1, y: 0, z: 0 }
    })
    const { container } = renderTablero()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
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

describe('Board - Surrender Capability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }))
  })
  afterEach(() => {
    cleanup()
    sessionStorage.clear()
  })

  test('shows defeat modal and saves stats when surrenderTrigger is activated', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero surrenderTrigger={false} />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getAllByText(/TÚ \(Azul\)/i)[0]).toBeInTheDocument())

    rerender(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero surrenderTrigger={true} />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/TE HAS RENDIDO/i)[0]).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(statsService.saveMatchResult).toHaveBeenCalledWith(
        expect.objectContaining({ result: 'lose' })
      )
    })
  })
})

describe('Board - Undo Capability', () => {
  beforeEach(() => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    vi.mocked(gameService.askBotMove).mockResolvedValue({
      api_version: "1.0", bot_id: "test", game_status: 'ongoing', coords: { x: 1, y: 0, z: 0 }
    })
  })
  afterEach(() => { cleanup(); vi.clearAllMocks(); })

  test('notifies parent via onUndoStatusChange when a move is made', async () => {
    const onUndoSpy = vi.fn()
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero onUndoStatusChange={onUndoSpy} />} />
        </Routes>
      </MemoryRouter>
    )

    expect(onUndoSpy).toHaveBeenCalledWith(false)

    const primeraCasilla = container.querySelectorAll('.casilla')[0]
    fireEvent.click(primeraCasilla)

    await waitFor(() => {
      expect(onUndoSpy).toHaveBeenCalledWith(true)
    })
  })

  test('undoTrigger restores the previous board state and turn', async () => {
    const { container, rerender } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero undoTrigger={0} />} />
        </Routes>
      </MemoryRouter>
    )

    const casillas = container.querySelectorAll('.casilla')
    fireEvent.click(casillas[0])

    await waitFor(() => {
      expect(casillas[0]).toHaveClass('jugador-b')
    })

    rerender(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero undoTrigger={1} />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(casillas[0]).not.toHaveClass('jugador-b')
      expect(screen.getAllByText(/TÚ \(Azul\)/i)[0]).toBeInTheDocument()
    })
  })
})

describe('Board - Timer and Pass Turn Capability', () => {
  beforeEach(() => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    vi.mocked(gameService.askBotMove).mockResolvedValue({
      api_version: "1.0", bot_id: "test", game_status: 'ongoing', coords: { x: 1, y: 0, z: 0 }
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  test('timer starts at 20s and counts down correctly', () => {
    vi.useFakeTimers()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'humano' } }]}>
        <Routes>
          <Route path="/game" element={<Tablero />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText(/⏱️ 20s/i)[0]).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getAllByText(/⏱️ 17s/i)[0]).toBeInTheDocument()
  })

  test('timer resets to 20s after a move is made', async () => {
    vi.useFakeTimers()
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'humano', tamanoSeleccionado: 3 } }]}>
        <Routes>
          <Route path="/game" element={<Tablero />} />
        </Routes>
      </MemoryRouter>
    )

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getAllByText(/⏱️ 15s/i)[0]).toBeInTheDocument()

    vi.useRealTimers()

    const casillas = container.querySelectorAll('.casilla')
    fireEvent.click(casillas[0])

    await waitFor(() => {
      expect(screen.getAllByText(/⏱️ 20s/i)[0]).toBeInTheDocument()
    })
  })

  test('timer reaching 0 automatically makes a random move and passes the turn', async () => {
    vi.useFakeTimers()
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'humano', tamanoSeleccionado: 3 } }]}>
        <Routes>
          <Route path="/game" element={<Tablero />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText(/JUGADOR 1 \(Azul\)/i)[0]).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(20000)
    })

    vi.useRealTimers()

    await waitFor(() => {
      expect(screen.getAllByText(/JUGADOR 2 \(Rojo\)/i)[0]).toBeInTheDocument()
    })

    const fichasAzules = container.querySelectorAll('.casilla.jugador-b')
    expect(fichasAzules.length).toBe(1)
  })

  test('passTurnTrigger manually executes an automatic move and passes the turn', async () => {
    const { container, rerender } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'humano', tamanoSeleccionado: 3 } }]}>
        <Routes>
          <Route path="/game" element={<Tablero passTurnTrigger={0} />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getAllByText(/JUGADOR 1 \(Azul\)/i)[0]).toBeInTheDocument()

    rerender(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'humano', tamanoSeleccionado: 3 } }]}>
        <Routes>
          <Route path="/game" element={<Tablero passTurnTrigger={1} />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/JUGADOR 2 \(Rojo\)/i)[0]).toBeInTheDocument()
    })

    const fichasAzules = container.querySelectorAll('.casilla.jugador-b')
    expect(fichasAzules.length).toBe(1)
  })
})

describe('Board - Modal Button Actions', () => {
  beforeEach(() => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' });
    sessionStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.useRealTimers();
  });

  test('Local mode: clicking "Jugar" button reloads the page', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    });

    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero tamano={3} />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(container.querySelectorAll('.casilla')[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/jugar/i)[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText(/jugar/i)[0]);

    expect(window.location.reload).toHaveBeenCalled();

    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  test('Online mode: clicking "Volver al Lobby" calls onLeave', async () => {
    const onLeaveSpy = vi.fn();

    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero tamano={3} isOnline={true} onlineColor="B" onLeave={onLeaveSpy} />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(container.querySelectorAll('.casilla')[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/Volver al Lobby/i)[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText(/Volver al Lobby/i)[0]);

    expect(onLeaveSpy).toHaveBeenCalled();
  });

  test('Clicking "Estadísticas" button calls onLeave', async () => {
    const onLeaveSpy = vi.fn();

    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={<Tablero tamano={3} onLeave={onLeaveSpy} />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(container.querySelectorAll('.casilla')[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/estadisticas/i)[0]).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText(/estadisticas/i)[0]);

    expect(onLeaveSpy).toHaveBeenCalled();
  });
});

describe('Board - Online Mode', () => {
  beforeEach(() => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })
    sessionStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }))
  })
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  const renderOnline = (lastOpponentLayout?: string) =>
    render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={
            <Tablero
              isOnline={true}
              onlineColor="B"
              tamano={3}
              lastOpponentLayout={lastOpponentLayout ?? null}
              onSendMove={vi.fn()}
              opponentName="Rival"
            />
          } />
        </Routes>
      </MemoryRouter>
    )

  test('renders online board and shows turn indicator', () => {
    renderOnline()
    expect(screen.getAllByText(/TÚ \(Azul\)/i)[0]).toBeInTheDocument()
  })

  test('online: clicking a cell calls onSendMove', async () => {
    const onSendMove = vi.fn()
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={
            <Tablero isOnline={true} onlineColor="B" tamano={3}
              lastOpponentLayout={null} onSendMove={onSendMove} opponentName="Rival" />
          } />
        </Routes>
      </MemoryRouter>
    )
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(onSendMove).toHaveBeenCalled()
    })
  })

  test('online: win is detected after player move', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'win' })
    const { container } = renderOnline()
    fireEvent.click(container.querySelectorAll('.casilla')[0])
    await waitFor(() => {
      expect(screen.getAllByText(/GANÓ EL AZUL|HAS GANADO/i)[0]).toBeInTheDocument()
    })
  })

  test('online: receives opponent move and updates board', async () => {
    const { rerender } = renderOnline()

    rerender(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={
            <Tablero isOnline={true} onlineColor="B" tamano={3}
              lastOpponentLayout="R....." onSendMove={vi.fn()} opponentName="Rival" />
          } />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/TÚ \(Azul\)/i)[0]).toBeInTheDocument()
    })
  })

  test('online: receives opponent move and detects defeat', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' })

    const { rerender } = renderOnline()

    vi.mocked(gameService.checkWinner).mockResolvedValueOnce({ status: 'win' })

    rerender(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes>
          <Route path="/game" element={
            <Tablero isOnline={true} onlineColor="B" tamano={3}
              lastOpponentLayout="R....." onSendMove={vi.fn()} opponentName="Rival" />
          } />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/HAS PERDIDO/i)[0]).toBeInTheDocument()
    })
  })
})

describe('Board - Branch Coverage Perfection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('user', JSON.stringify({ userId: '123', username: 'Test' }));
  });
  
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  test('disables clicked cell in human mode and blocks bot cells when not player turn', async () => {
    vi.mocked(gameService.checkWinner).mockResolvedValue({ status: 'ongoing' });
    
    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'humano' } }]}>
        <Routes><Route path="/game" element={<Tablero tamano={3} />} /></Routes>
      </MemoryRouter>
    );
    const cell = container.querySelectorAll('.casilla')[0];
    fireEvent.click(cell); 
    await waitFor(() => expect(cell).toBeDisabled()); 

    const { container: containerBot } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'bot', colorUsuario: 'R' } }]}>
        <Routes><Route path="/game" element={<Tablero tamano={3} />} /></Routes>
      </MemoryRouter>
    );
    const cellBot = containerBot.querySelectorAll('.casilla')[0];
    expect(cellBot).toBeDisabled(); 
  });

  test('does not show bot calculating message when loading in human mode', async () => {
    let resolveCheck: any;
    const slowPromise = new Promise((resolve) => { resolveCheck = resolve; });
    vi.mocked(gameService.checkWinner).mockReturnValue(slowPromise as any);

    const { container } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'humano' } }]}>
        <Routes><Route path="/game" element={<Tablero tamano={3} />} /></Routes>
      </MemoryRouter>
    );
    
    fireEvent.click(container.querySelectorAll('.casilla')[0]);
    
    expect(screen.queryByText(/El Bot está calculando/i)).not.toBeInTheDocument();
    
    resolveCheck({ status: 'ongoing' });
    await waitFor(() => expect(screen.getAllByText(/Turno/i)[0]).toBeInTheDocument());
  });

  test('displays red title on defeat and handles return to lobby without onLeave prop', async () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes><Route path="/game" element={<Tablero isOnline={true} tamano={3} surrenderTrigger={false} />} /></Routes>
      </MemoryRouter>
    );

    rerender(
      <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
        <Routes><Route path="/game" element={<Tablero isOnline={true} tamano={3} surrenderTrigger={true} />} /></Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const title = screen.getByText(/HAS PERDIDO/i);
      expect(title).toHaveClass('turno-rojo'); 
    });

    const lobbyButton = screen.getByText(/Volver al Lobby/i);
    fireEvent.click(lobbyButton);
  });

  describe('useTablero - Error catch blocks', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      cleanup();
      vi.clearAllMocks();
    });

    test('catches and logs error in online mode when winner verification fails', async () => {
      vi.mocked(gameService.checkWinner).mockRejectedValueOnce(new Error('Online Check Error'));
      
      const { container } = render(
        <MemoryRouter initialEntries={[{ pathname: '/game' }]}>
          <Routes><Route path="/game" element={<Tablero isOnline={true} onlineColor="B" tamano={3} />} /></Routes>
        </MemoryRouter>
      );
      
      fireEvent.click(container.querySelectorAll('.casilla')[0]);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Error verificando victoria:", expect.any(Error));
      });
    });

    test('catches and logs error in human mode when winner verification fails', async () => {
      vi.mocked(gameService.checkWinner).mockRejectedValueOnce(new Error('Human Check Error'));
      
      const { container } = render(
        <MemoryRouter initialEntries={[{ pathname: '/game', state: { modoSeleccionado: 'humano' } }]}>
          <Routes><Route path="/game" element={<Tablero tamano={3} />} /></Routes>
        </MemoryRouter>
      );
      
      fireEvent.click(container.querySelectorAll('.casilla')[0]);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("Error verificando victoria:", expect.any(Error));
      });
    });
  });
});