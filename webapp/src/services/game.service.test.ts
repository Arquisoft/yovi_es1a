import { describe, test, expect, vi, beforeEach} from 'vitest'
import { gameService } from '../services/game.service'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  vi.clearAllMocks()
})

// ── askBotMove ────────────────────────────────────────────────────────────────

describe('gameService.askBotMove', () => {
  test('calls fetch with correct URL, method and headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ coords: { x: 1, y: 2, z: 0 }, game_status: 'ongoing' }),
    })

    await gameService.askBotMove('random_bot', 7, 1, 'BRRB...')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bot/play'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  test('sends correct body with position and strategy', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ coords: { x: 0, y: 1, z: 2 }, game_status: 'ongoing' }),
    })

    await gameService.askBotMove('monte_carlo_bot', 5, 2, 'BBRR')

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)

    expect(body).toEqual({
      position: {
        size: 5,
        turn: 2,
        players: ['B', 'R'],
        layout: 'BBRR',
      },
      strategy: 'monte_carlo_bot',
    })
  })

  test('returns correctly shaped BotMoveResponse', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ coords: { x: 3, y: 1, z: 0 }, game_status: 'ongoing' }),
    })

    const result = await gameService.askBotMove('random_bot', 5, 1, 'BBR')

    expect(result).toEqual({
      api_version: 'v1',
      bot_id: 'random_bot',
      coords: { x: 3, y: 1, z: 0 },
      game_status: 'ongoing',
    })
  })

  test('throws and logs when response is not ok', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 })

    await expect(gameService.askBotMove('random_bot', 5, 1, 'BB')).rejects.toThrow(
      'HTTP error! status: 500'
    )
    expect(consoleSpy).toHaveBeenCalledWith('Error calling Rust API:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  test('throws and logs when fetch itself rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))

    await expect(gameService.askBotMove('random_bot', 5, 1, 'BB')).rejects.toThrow('Network failure')
    expect(consoleSpy).toHaveBeenCalledWith('Error calling Rust API:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})

// ── checkWinner ───────────────────────────────────────────────────────────────

describe('gameService.checkWinner', () => {
  test('calls fetch with correct URL, method and headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ongoing' }),
    })

    await gameService.checkWinner(7, 'BBRR...')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bot/check-winner'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  test('sends correct body with size and layout', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ongoing' }),
    })

    await gameService.checkWinner(5, 'BBRR')

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)

    expect(body).toEqual({ size: 5, layout: 'BBRR' })
  })

  test('returns CheckWinnerResponse on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'B_wins' }),
    })

    const result = await gameService.checkWinner(5, 'BBB')
    expect(result).toEqual({ status: 'B_wins' })
  })

  test('throws and logs when response is not ok', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })

    await expect(gameService.checkWinner(5, 'BB')).rejects.toThrow(
      'Error en el servidor de Node: 503'
    )
    expect(consoleSpy).toHaveBeenCalledWith('Error al verificar ganador:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  test('throws and logs when fetch itself rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

    await expect(gameService.checkWinner(5, 'BB')).rejects.toThrow('Connection refused')
    expect(consoleSpy).toHaveBeenCalledWith('Error al verificar ganador:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})