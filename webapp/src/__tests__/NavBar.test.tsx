import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockSetLang = vi.fn();
vi.mock('../idiomaConf/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    lang: 'es',
    setLang: mockSetLang
  })
}));

// Helper: renderiza con usuario logueado en localStorage
const renderWithUser = (activeTab: string = 'play') => {
  localStorage.setItem('user', JSON.stringify({ userId: '123', username: 'JugadorPro' }));
  return render(
    <MemoryRouter>
      <NavBar activeTab={activeTab as any} />
    </MemoryRouter>
  );
};

// Helper: renderiza sin usuario
const renderWithoutUser = (activeTab: string = 'home') => {
  localStorage.removeItem('user');
  return render(
    <MemoryRouter>
      <NavBar activeTab={activeTab as any} />
    </MemoryRouter>
  );
};

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('It loads the user from localStorage and displays their username', () => {
    renderWithUser();
    expect(screen.getByText('JugadorPro')).toBeInTheDocument();
  });

  // FIX: El botón de logout solo existe cuando hay usuario en localStorage.
  // El test original no ponía usuario, así que el botón nunca aparecía.
  test('It logs out correctly, removing localStorage and navigating to login', async () => {
    const user = userEvent.setup();
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    renderWithUser(); // <-- necesita usuario para que aparezca el botón

    const logoutButton = screen.getByTitle('Cerrar sesión');
    await user.click(logoutButton);

    expect(removeItemSpy).toHaveBeenCalledWith('user');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('It changes the language to Spanish ("es")', async () => {
    const user = userEvent.setup();
    renderWithoutUser();
    await user.selectOptions(screen.getByRole('combobox'), 'es');
    expect(mockSetLang).toHaveBeenCalledWith('es');
  });

  test('It changes the language to English', async () => {
    const user = userEvent.setup();
    renderWithoutUser();
    await user.selectOptions(screen.getByRole('combobox'), 'en');
    expect(mockSetLang).toHaveBeenCalledWith('en');
  });

  test('It changes the language to Italian', async () => {
    const user = userEvent.setup();
    renderWithoutUser();
    await user.selectOptions(screen.getByRole('combobox'), 'it');
    expect(mockSetLang).toHaveBeenCalledWith('it');
  });

  test('It changes the language to French', async () => {
    const user = userEvent.setup();
    renderWithoutUser();
    await user.selectOptions(screen.getByRole('combobox'), 'fr');
    expect(mockSetLang).toHaveBeenCalledWith('fr');
  });

  test('It changes the language to German', async () => {
    const user = userEvent.setup();
    renderWithoutUser();
    await user.selectOptions(screen.getByRole('combobox'), 'de');
    expect(mockSetLang).toHaveBeenCalledWith('de');
  });

  test('It applies the default case (Spanish) if it receives an unknown value', async () => {
    renderWithoutUser();
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'unknown_lang' } });
    
    expect(mockSetLang).toHaveBeenCalledWith('es');
  });

  test('It navigates to /configureGame when clicking "Jugar"', async () => {
    const user = userEvent.setup();
    renderWithUser('stats'); // usuario logueado para que aparezca el botón
    await user.click(screen.getByText('jugar'));
    expect(mockNavigate).toHaveBeenCalledWith('/configureGame');
  });

  test('It navigates to /statistics when clicking "Estadísticas"', async () => {
    const user = userEvent.setup();
    renderWithUser('help');
    await user.click(screen.getByText('estadisticas'));
    expect(mockNavigate).toHaveBeenCalledWith('/statistics');
  });

  test('It navigates to /help when clicking "Ayuda"', async () => {
    const user = userEvent.setup();
    renderWithUser('play');
    await user.click(screen.getByText('ayuda'));
    expect(mockNavigate).toHaveBeenCalledWith('/help');
  });

  test('It navigates to /clanes when clicking "Clanes"', async () => {
    const user = userEvent.setup();
    renderWithUser('help');
    await user.click(screen.getByText('Clanes'));
    expect(mockNavigate).toHaveBeenCalledWith('/clanes');
  });

  test('It navigates to / when clicking "Inicio"', async () => {
    const user = userEvent.setup();
    renderWithUser('help');
    await user.click(screen.getByText('inicio'));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('It navigates to /login when clicking "Iniciar Sesión" (no user logged in)', async () => {
    const user = userEvent.setup();
    renderWithoutUser('home');
    
    const loginButton = screen.getByText('iniciarSes');
    await user.click(loginButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('It navigates to /register when clicking "Crear Cuenta" (no user logged in)', async () => {
    const user = userEvent.setup();
    renderWithoutUser('home');
    
    const registerButton = screen.getByText('crearCuenta');
    await user.click(registerButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('It navigates to /about when clicking the about icon', async () => {
    const user = userEvent.setup();
    renderWithoutUser('home');
    
    const aboutButton = screen.getByTitle('About us');
    await user.click(aboutButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });
});