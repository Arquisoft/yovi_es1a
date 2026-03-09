import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../pages/Login'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

describe('LoginForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // Login sin username ni password --> Mensaje: Please enter username and password
  test('Login sin username ni password', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    )

    const user = userEvent.setup()

    const button = screen.getByRole('button', { name: /log in!/i });
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument()
    })
  })

  // Login sin username
  test('login sin username', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/contra/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in!/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument();
    });
  });

  // Login sin contraseña
  test('login sin contraseña', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/user/i), 'Pablo');
    await user.click(screen.getByRole('button', { name: /log in!/i }));

    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument();
    });
  });

  // Login con credenciales incorrectas
  test('login con credenciales incorrectas', async () => {
    // Mock fetch para simular login fallido
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid password' }),
    } as Response);

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/user/i), 'Pablo');
    await user.type(screen.getByLabelText(/contra/i), '111');
    await user.click(screen.getByRole('button', { name: /log in!/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid password/i)).toBeInTheDocument();
    });
  });

  // Login con credenciales correctas
  test('login con credenciales correctas', async () => {
    // Mock fetch para login exitoso
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: '1', username: 'Pablo' }),
    } as Response);

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/user/i), 'Pablo');
    await user.type(screen.getByLabelText(/contra/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in!/i }));

    await waitFor(() => {
      expect(screen.getByText(/¡Bienvenido de nuevo, Pablo!/i)).toBeInTheDocument();
    });
  });

})