import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../pages/Register'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { authService } from '../services/auth.service'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

vi.mock('../services/auth.service', () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn()
  }
}))

vi.mock('../idiomaConf/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({
    t: (key: string) => key,
  }))
}))

vi.mock('../components/AuthForm', () => ({
  default: ({ onSubmit, outsideError }: any) => (
    <div>
      <button data-testid="btn-empty" onClick={() => onSubmit('', '', '')}>
        Mandar Todo Vacío
      </button>
      <button data-testid="btn-no-email" onClick={() => onSubmit('User', 'Pass', '')}>
        Mandar Sin Email
      </button>
      <button data-testid="btn-valid" onClick={() => onSubmit('Pablo', 'password123', 'pablo@test.com')}>
        Mandar Todo Correcto
      </button>
      {outsideError && <div>{`⚠️ ${outsideError}`}</div>}
    </div>
  )
}))

describe('RegisterForm', () => {
  afterEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    sessionStorage.clear()
  })

  test('triggers the internal validation error when all fields are empty', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()

    await user.click(screen.getByTestId('btn-empty'))

    expect(screen.getByText('⚠️ Por favor rellena todos los campos')).toBeInTheDocument()
  })

  test('triggers the internal validation error when email is missing', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()

    await user.click(screen.getByTestId('btn-no-email'))

    expect(screen.getByText('⚠️ Por favor rellena todos los campos')).toBeInTheDocument()
  })

  test('shows specific error message when registration fails via API rejection', async () => {
    vi.mocked(authService.register).mockRejectedValueOnce({
      response: { data: { error: 'Email already in use' } }
    })

    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('btn-valid'))

    await waitFor(() => {
      expect(screen.getByText('⚠️ Email already in use')).toBeInTheDocument()
    })
  })

  test('shows standard error message when registration fails via JavaScript Error', async () => {
    vi.mocked(authService.register).mockRejectedValueOnce(new Error('Network timeout'))

    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('btn-valid'))

    await waitFor(() => {
      expect(screen.getByText('⚠️ Network timeout')).toBeInTheDocument()
    })
  })

  test('shows generic fallback error when rejection lacks a specific message', async () => {
    vi.mocked(authService.register).mockRejectedValueOnce({})

    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('btn-valid'))

    await waitFor(() => {
      expect(screen.getByText('⚠️ An error occurred')).toBeInTheDocument()
    })
  })

  test('successfully registers the user, saves to localStorage, and navigates', async () => {
    vi.mocked(authService.register).mockResolvedValueOnce({
      userId: 1,
      username: 'Pablo'
    })
    

    vi.mocked(authService.login).mockResolvedValueOnce({})

    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByTestId('btn-valid'))

    await waitFor(() => {
      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
      expect(screen.getByText('Pablo')).toBeInTheDocument()
      expect(sessionStorage.getItem('user')).toBe(JSON.stringify({ userId: 1, username: 'Pablo' })) // ✅ dentro del waitFor
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/configureGame')
    }, { timeout: 4000 })
    })
})
