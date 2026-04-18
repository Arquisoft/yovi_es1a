import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../pages/Login'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useLanguage } from '../idiomaConf/LanguageContext'

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
    login: vi.fn(),
    register: vi.fn(),
  }
}))

// Añadimos lang y setLang para que TypeScript no se queje de LanguageContextProps
vi.mock('../idiomaConf/LanguageContext', () => ({
  useLanguage: vi.fn(() => ({
    t: (key: string) => key,
    lang: 'es',
    setLang: vi.fn()
  }))
}))

describe('LoginForm', () => {
  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.useRealTimers()
  })

  test('displays a validation message when username and password fields are empty', async () => {
    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /log in!/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument()
    })
  })

  test('displays a validation message when the username is not provided', async () => {
    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument()
    })
  })

  test('displays a validation message when the password is not provided', async () => {
    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.click(screen.getByRole('button', { name: /log in!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument()
    })
  })

  test('displays the standard translation error when login credentials are invalid', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(new Error('Invalid password'))
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/contra/i), '111')
    await user.click(screen.getByRole('button', { name: /log in!/i }))

    await waitFor(() => {
      expect(screen.getByText(/errorLogin/i)).toBeInTheDocument()
    })
    
    consoleSpy.mockRestore();
  })

  test('displays the fallback error message when the translation string is missing', async () => {
    // También le pasamos lang y setLang aquí al forzar el error de traducción
    vi.mocked(useLanguage).mockReturnValue({
      t: (key: string) => key === 'errorLogin' ? '' : key,
      lang: 'es',
      setLang: vi.fn()
    });

    vi.mocked(authService.login).mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/contra/i), '111')
    await user.click(screen.getByRole('button', { name: /log in!/i }))

    await waitFor(() => {
      expect(screen.getByText("Usuario o contraseña incorrectos")).toBeInTheDocument()
    })

    consoleSpy.mockRestore();
  })

  test('shows a welcome message and navigates to game configuration after a successful login', async () => {
  const localStorageMock: Record<string, string> = {};
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
    localStorageMock[key] = value;
  });
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
    return localStorageMock[key] ?? null;
  });

  vi.mocked(authService.login).mockResolvedValueOnce({
    userId: 1,
    username: 'Pablo',
    token: 'fake-jwt-token'
  })

  render(<MemoryRouter><LoginForm /></MemoryRouter>)
  const user = userEvent.setup()
  
  await user.type(screen.getByLabelText(/user/i), 'Pablo')
  await user.type(screen.getByLabelText(/contra/i), 'password123')
  await user.click(screen.getByRole('button', { name: /log in!/i }))

  await waitFor(() => {
    expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
    expect(screen.getByText(/Pablo/i)).toBeInTheDocument()
  })

  expect(localStorageMock['user']).toBe(JSON.stringify({ userId: 1, username: 'Pablo' }))
  expect(localStorageMock['token']).toBe('fake-jwt-token')

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/configureGame')
  }, { timeout: 4000 })

  vi.restoreAllMocks()
})
})