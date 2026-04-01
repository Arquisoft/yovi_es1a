// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { statsService, type MatchData } from '../services/stats.service'

const mockMatchData: MatchData = {
  user: 'user123',
  result: 'win',
  duration: 120,
  boardSize: 7,
  opponent: 'random_bot',
  totalMoves: 30,
  gameMode: 'bot',
}

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem('token', 'fake-token')
})

afterEach(() => {
  localStorage.clear()
})

// ── saveMatchResult ───────────────────────────────────────────────────────────

describe('statsService.saveMatchResult', () => {
  test('calls fetch with correct URL, method and headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, ...mockMatchData }),
    })

    await statsService.saveMatchResult(mockMatchData)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/matches/'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-token',
        }),
        body: JSON.stringify(mockMatchData),
      })
    )
  })

  test('returns parsed JSON on success', async () => {
    const mockResponse = { id: 42, ...mockMatchData }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await statsService.saveMatchResult(mockMatchData)
    expect(result).toEqual(mockResponse)
  })

  test('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    await expect(statsService.saveMatchResult(mockMatchData)).rejects.toThrow(
      'The statistics could not be saved to the database'
    )
  })

  test('throws and logs when fetch itself rejects', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))

    await expect(statsService.saveMatchResult(mockMatchData)).rejects.toThrow('Network failure')
    expect(consoleSpy).toHaveBeenCalledWith('Error saving stats:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  test('uses token from localStorage in Authorization header', async () => {
    localStorage.setItem('token', 'my-secret-token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    await statsService.saveMatchResult(mockMatchData)

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers['Authorization']).toBe('Bearer my-secret-token')
  })
})

// ── getMatchHistory ───────────────────────────────────────────────────────────

describe('statsService.getMatchHistory', () => {
  test('calls fetch with correct URL including userId', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ matches: [], total: 0 }),
    })

    await statsService.getMatchHistory('user123')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/matches/user/user123'),
      expect.objectContaining({ method: 'GET' })
    )
  })

  test('returns data on success', async () => {
    const mockData = { matches: [{ id: 1 }], total: 1 }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await statsService.getMatchHistory('user123')
    expect(result).toEqual(mockData)
  })

  test('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Unauthorized' }),
    })

    await expect(statsService.getMatchHistory('user123')).rejects.toThrow('Unauthorized')
  })

  test('throws generic message when error field is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    await expect(statsService.getMatchHistory('user123')).rejects.toThrow('Error fetching history')
  })

  test('appends result filter to query params when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ matches: [] }),
    })

    await statsService.getMatchHistory('user123', 1, 5, { result: 'win' })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('result=win')
  })

  test('appends maxMoves filter when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ matches: [] }),
    })

    await statsService.getMatchHistory('user123', 1, 5, { maxMoves: 20 })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('maxMoves=20')
  })

  test('appends maxDuration filter when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ matches: [] }),
    })

    await statsService.getMatchHistory('user123', 1, 5, { maxDuration: 300 })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain('maxDuration=300')
  })

  test('uses token from localStorage in Authorization header', async () => {
    localStorage.setItem('token', 'history-token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ matches: [] }),
    })

    await statsService.getMatchHistory('user123')

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers['Authorization']).toBe('Bearer history-token')
  })
})