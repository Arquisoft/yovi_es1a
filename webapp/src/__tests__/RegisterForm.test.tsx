import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../pages/Register'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'
import { authService } from '../services/auth.service'

describe('RegisterForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('shows validation error when username, email and password are empty', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /lets go!/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  test('shows validation error when username is missing', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  test('shows validation error when email is missing', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  test('shows validation error when password is missing', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  test('shows validation error when username and email are missing', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  test('shows validation error when username and password are missing', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  test('shows validation error when email and password are missing', async () => {
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  test('shows error when password is shorter than 3 characters', async () => {
    vi.spyOn(authService, 'register').mockRejectedValueOnce(
      new Error('Password must be at least 3 characters')
    )

    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), '3')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  test('shows error when email is already registered', async () => {
    vi.spyOn(authService, 'register').mockRejectedValueOnce(
      new Error('Email already registered')
    )

    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Email already registered/i)).toBeInTheDocument()
    })
  })

  test('shows error when username is already taken', async () => {
    vi.spyOn(authService, 'register').mockRejectedValueOnce(
      new Error('Username already taken')
    )

    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Username already taken/i)).toBeInTheDocument()
    })
  })

  test('shows welcome message with username on successful registration', async () => {
    vi.spyOn(authService, 'register').mockResolvedValueOnce({
      message: 'User successfully created',
      username: 'Pablo',
      userId: 1
    })
    
    render(<MemoryRouter><RegisterForm /></MemoryRouter>)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/bienvenido/i)).toBeInTheDocument()
      expect(screen.getByText(/Pablo/i)).toBeInTheDocument()
    })
  })
})