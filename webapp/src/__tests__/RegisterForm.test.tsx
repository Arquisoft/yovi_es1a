import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../pages/Register'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

describe('RegisterForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Registrarse sin username, email ni password --> Mensaje: Please fill all fields
  test('shows validation error when username, email and password is empty', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )

    const user = userEvent.setup()
    const button = screen.getByRole('button', { name: /lets go!/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  // Registrarse sin username
  test('registrarse sin username', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  // Registrarse sin email
  test('registrarse sin email', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  // Registrarse sin password
  test('registrarse sin password', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  // Registrarse sin user ni email
  test('registrarse sin user ni email', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  // Registrarse sin user ni password
  test('registrarse sin user ni password', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  // Registrarse sin email ni password
  test('registrarse sin email ni password', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()
    })
  })

  // Registro con contraseña de menos de tres caracteres
  test('registro con contraseña de menos de tres caracteres', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Password must be at least 3 characters' }),
    } as Response)

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), '3')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  // Registro con email ya registrado
  test('Registro con email ya registrado', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Email already registered' }),
    } as Response)

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Email already registered/i)).toBeInTheDocument()
    })
  })

  // Registro con username ya registrado
  test('Registro con username ya registrado', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: 'Username already taken' }),
    } as Response)

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/Username already taken/i)).toBeInTheDocument()
    })
  })

  // Registro válido
  test('submits username and displays success message', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User successfully created' }), 
    } as Response)
    
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')
    await user.type(screen.getByLabelText(/contra/i), 'password123')
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(screen.getByText(/¡Usuario registrado correctamente!/i)).toBeInTheDocument()
    })
  })
})