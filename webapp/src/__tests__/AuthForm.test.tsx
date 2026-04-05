// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import '@testing-library/jest-dom/vitest';

// Mockeamos el idioma para que devuelva la misma palabra que le pedimos (user, email, contra)
vi.mock('../idiomaConf/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key })
}));

describe('AuthForm Component', () => {
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    title: 'Test Form',
    buttonText: 'Submit',
    loadingText: 'Loading...',
    bottomText: 'Go back',
    bottomLinkText: 'Click here',
    bottomLinkPath: '/somewhere',
    onSubmit: mockOnSubmit,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 1. TESTEAMOS QUE RENDERIZA MODO LOGIN (isRegister = false)
  test('renders correctly in login mode (no email field)', () => {
    render(
      <MemoryRouter>
        <AuthForm {...defaultProps} isRegister={false} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/user/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contra/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument(); // No debe haber email
  });

  // 2. TESTEAMOS LA VALIDACIÓN DEL LOGIN
  test('shows validation error in login mode when fields are empty', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthForm {...defaultProps} isRegister={false} />
      </MemoryRouter>
    );
    
    await user.click(screen.getByRole('button', { name: /Submit/i }));
    
    await waitFor(() => {
      // Esta es la línea que te faltaba por cubrir
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // 3. TESTEAMOS QUE SE LLAMA AL SUBMIT CON LOS DATOS CORRECTOS (MODO REGISTRO)
  test('calls onSubmit with correct data when valid', async () => {
    const user = userEvent.setup();
    // Hacemos que la promesa se resuelva para que el loading termine
    mockOnSubmit.mockResolvedValueOnce(undefined); 

    render(
      <MemoryRouter>
        <AuthForm {...defaultProps} isRegister={true} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/user/i), 'TestUser');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/contra/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    // Verificamos que se han pasado las 3 cosas
    expect(mockOnSubmit).toHaveBeenCalledWith('TestUser', 'password123', 'test@test.com');
  });

  // 4. TESTEAMOS EL FALLO RARO SIN MENSAJE EN LOGIN (Para cubrir el "Error de conexión con el servidor")
  test('shows fallback error message for login mode when error has no specific message', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce({}); // Rechazo sin mensaje ('err.message' vacío)

    render(
      <MemoryRouter>
        <AuthForm {...defaultProps} isRegister={false} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/user/i), 'TestUser');
    await user.type(screen.getByLabelText(/contra/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error de conexión con el servidor/i)).toBeInTheDocument();
    });
  });

  // 5. TESTEAMOS EL FALLO RARO SIN MENSAJE EN REGISTRO (Para cubrir el "Network error")
  test('shows fallback error message for register mode when error has no specific message', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce({}); // Rechazo sin mensaje

    render(
      <MemoryRouter>
        <AuthForm {...defaultProps} isRegister={true} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/user/i), 'TestUser');
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/contra/i), 'password123');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});