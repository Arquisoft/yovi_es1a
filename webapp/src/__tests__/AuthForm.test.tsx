import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import '@testing-library/jest-dom/vitest';

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

  test('renders correctly in login mode (no email field)', () => {
    render(
      <MemoryRouter>
        <AuthForm {...defaultProps} isRegister={false} />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/user/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contra/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  test('shows validation error in login mode when fields are empty', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthForm {...defaultProps} isRegister={false} />
      </MemoryRouter>
    );
    
    await user.click(screen.getByRole('button', { name: /Submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with correct data when valid', async () => {
    const user = userEvent.setup();
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

    expect(mockOnSubmit).toHaveBeenCalledWith('TestUser', 'password123', 'test@test.com');
  });

  test('shows fallback error message for login mode when error has no specific message', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce({});

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

  test('shows fallback error message for register mode when error has no specific message', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce({});

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