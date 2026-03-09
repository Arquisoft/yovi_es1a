import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../pages/Login'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { authService } from '../services/auth.service'

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  }
}))

describe('LoginForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('shows validation error when username and password are empty', async () => {
    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /log in!/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument()
    })
  })

  test('shows validation error when username is missing', async () => {
    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /log in!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument()
    })
  })

  test('shows validation error when password is missing', async () => {
    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.click(screen.getByRole('button', { name: /log in!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument()
    })
  })

  test('shows error when credentials are incorrect', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(
      new Error('Invalid password')
    )

    render(<MemoryRouter><LoginForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/contra/i), '111')
    await user.click(screen.getByRole('button', { name: /log in!/i }))

    await waitFor(() => {
      // El componente muestra t("errorLogin") para cualquier error de credenciales
      expect(screen.getByText(/errorLogin/i)).toBeInTheDocument()
    })
  })

  test('shows welcome message with username on successful login', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      userId: 1,
      username: 'Pablo'
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
  })
})