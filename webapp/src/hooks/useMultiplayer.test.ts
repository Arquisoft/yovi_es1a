// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { useMultiplayer } from './useMultiplayer'
import { matchService } from '../services/match.service'
import { UserUtils } from '../utils/user.utils'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: {} })
}))

vi.mock('../services/match.service', () => ({
  matchService: { saveWinByAbandonment: vi.fn() }
}))

vi.mock('../utils/user.utils', () => ({
  UserUtils: { getUserId: vi.fn() }
}))

const { mockSocket } = vi.hoisted(() => {
  const mockSocket = {
    connected: false,
    connect: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  }
  return { mockSocket }
})

vi.mock('../services/socket.service', () => ({
  socket: mockSocket,
}))

// Helper: obtiene el callback registrado para un evento concreto
const getSocketCallback = (eventName: string) => {
  const call = mockSocket.on.mock.calls.find((args: string[]) => args[0] === eventName)
  return call?.[1]
}

describe('useMultiplayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSocket.connected = false
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('returns correct initial state', () => {
    const { result } = renderHook(() => useMultiplayer())
    expect(result.current.isConnected).toBe(false)
    expect(result.current.roomCode).toBeNull()
    expect(result.current.errorMsg).toBe('')
    expect(result.current.gameStarted).toBe(false)
    expect(result.current.myColor).toBeNull()
    expect(result.current.opponentName).toBe('')
    expect(result.current.lastOpponentMove).toBeNull()
    expect(result.current.boardSize).toBe(5)
  })

  test('calls socket.connect on mount', () => {
    renderHook(() => useMultiplayer())
    expect(mockSocket.connect).toHaveBeenCalledTimes(1)
  })

  test('registers all socket event listeners on mount', () => {
    renderHook(() => useMultiplayer())
    const registeredEvents = mockSocket.on.mock.calls.map((args: string[]) => args[0])
    expect(registeredEvents).toContain('connect')
    expect(registeredEvents).toContain('disconnect')
    expect(registeredEvents).toContain('roomCreated')
    expect(registeredEvents).toContain('gameStarted')
    expect(registeredEvents).toContain('roomError')
    expect(registeredEvents).toContain('moveReceived')
    expect(registeredEvents).toContain('opponent_disconnected')
    expect(registeredEvents).toContain('matchFinishedCleanup')
  })

  test('sets isConnected to true on "connect" event', () => {
    const { result } = renderHook(() => useMultiplayer())
    act(() => { getSocketCallback('connect')() })
    expect(result.current.isConnected).toBe(true)
  })

  test('sets isConnected to false on "disconnect" event', () => {
    mockSocket.connected = true
    const { result } = renderHook(() => useMultiplayer())
    act(() => {
      getSocketCallback('connect')()
      getSocketCallback('disconnect')()
    })
    expect(result.current.isConnected).toBe(false)
  })

  test('sets roomCode and clears errorMsg on "roomCreated" event', () => {
    const { result } = renderHook(() => useMultiplayer())
    act(() => { getSocketCallback('roomCreated')('ABC123') })
    expect(result.current.roomCode).toBe('ABC123')
    expect(result.current.errorMsg).toBe('')
  })

  test('sets errorMsg on "roomError" event', () => {
    const { result } = renderHook(() => useMultiplayer())
    act(() => { getSocketCallback('roomError')('Room not found') })
    expect(result.current.errorMsg).toBe('Room not found')
  })

  test('sets lastOpponentMove on "moveReceived" event', () => {
    const { result } = renderHook(() => useMultiplayer())
    const fakeMove = { row: 2, col: 3 }
    act(() => { getSocketCallback('moveReceived')(fakeMove) })
    expect(result.current.lastOpponentMove).toEqual(fakeMove)
  })

  test('sets all gameStarted fields correctly on "gameStarted" event', () => {
    const { result } = renderHook(() => useMultiplayer())
    const payload = { roomCode: 'XYZ99', color: 'R' as const, opponentName: 'PlayerTwo', tamano: 9 }
    act(() => { getSocketCallback('gameStarted')(payload) })
    expect(result.current.roomCode).toBe('XYZ99')
    expect(result.current.myColor).toBe('R')
    expect(result.current.opponentName).toBe('PlayerTwo')
    expect(result.current.boardSize).toBe(9)
    expect(result.current.gameStarted).toBe(true)
    expect(result.current.errorMsg).toBe('')
  })

  test('removes all socket listeners on unmount', () => {
    const { unmount } = renderHook(() => useMultiplayer())
    unmount()
    const removedEvents = mockSocket.off.mock.calls.map((args: string[]) => args[0])
    expect(removedEvents).toContain('connect')
    expect(removedEvents).toContain('disconnect')
    expect(removedEvents).toContain('roomCreated')
    expect(removedEvents).toContain('gameStarted')
    expect(removedEvents).toContain('roomError')
    expect(removedEvents).toContain('moveReceived')
  })

  test('createRoom emits "createRoom" with username and board size', () => {
    const { result } = renderHook(() => useMultiplayer())
    act(() => { result.current.createRoom('Alice', 7) })
    
    // CAMBIAMOS null POR undefined
    expect(mockSocket.emit).toHaveBeenCalledWith('createRoom', { hostId: undefined, hostUsername: 'Alice', tamano: 7 })
  })

  test('joinRoom emits "joinRoom" with uppercased code and username', () => {
    const { result } = renderHook(() => useMultiplayer())
    act(() => { result.current.joinRoom('abc123', 'Bob') })
    
    // CAMBIAMOS null POR undefined
    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', { guestId: undefined, roomCode: 'ABC123', guestUsername: 'Bob' })
  })

  test('sendMove emits "makeMove" with room code and move data', () => {
    const { result } = renderHook(() => useMultiplayer())
    const move = { row: 1, col: 2 }
    act(() => { result.current.sendMove('ROOM1', move) })
    expect(mockSocket.emit).toHaveBeenCalledWith('makeMove', { roomCode: 'ROOM1', moveData: move })
  })

  test('initialises isConnected as true when socket is already connected', () => {
    mockSocket.connected = true
    const { result } = renderHook(() => useMultiplayer())
    expect(result.current.isConnected).toBe(true)
  })

  test('leaveMatchGracefully emits event and resets state after timeout', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useMultiplayer())

    act(() => { result.current.leaveMatchGracefully() })
    expect(mockSocket.emit).toHaveBeenCalledWith('leaveMatchGracefully')

    act(() => { vi.advanceTimersByTime(100) })
    expect(result.current.gameStarted).toBe(false)
    expect(result.current.roomCode).toBeNull()

    vi.useRealTimers()
  })

  test('handles opponent_disconnected event correctly', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(UserUtils.getUserId).mockReturnValue('user123')
    vi.mocked(matchService.saveWinByAbandonment).mockResolvedValue(undefined as any)

    const { result } = renderHook(() => useMultiplayer())

    await act(async () => {
      await getSocketCallback('opponent_disconnected')()
    })

    expect(alertSpy).toHaveBeenCalledWith("¡Tu oponente se ha desconectado! Has ganado la partida.")
    expect(result.current.gameStarted).toBe(false)
    alertSpy.mockRestore()
  })

  test('handles matchFinishedCleanup event correctly', () => {
    const { result } = renderHook(() => useMultiplayer())

    act(() => {
      getSocketCallback('matchFinishedCleanup')()
    })

    expect(result.current.gameStarted).toBe(false)
    expect(result.current.roomCode).toBeNull()
  })

  test('handles opponent_disconnected event correctly when user is not logged in (no userId)', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    vi.mocked(UserUtils.getUserId).mockReturnValue(null)

    const { result } = renderHook(() => useMultiplayer())

    await act(async () => {
      await getSocketCallback('opponent_disconnected')()
    })

    expect(alertSpy).toHaveBeenCalledWith("¡Tu oponente se ha desconectado! Has ganado la partida.")
    expect(result.current.gameStarted).toBe(false)
    
    expect(matchService.saveWinByAbandonment).not.toHaveBeenCalled()

    alertSpy.mockRestore()
  })
})