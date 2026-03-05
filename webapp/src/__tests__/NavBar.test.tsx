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

describe('NavBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('It loads the user from localStorage and displays their username', () => {
    const fakeUser = { userId: '123', username: 'JugadorPro' };
    localStorage.setItem('user', JSON.stringify(fakeUser));

    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );

    expect(screen.getByText('JugadorPro')).toBeInTheDocument();
  });

  test('It logs out correctly, removing localStorage and navigating to login', async () => {
    const user = userEvent.setup();
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );

    const logoutButton = screen.getByTitle('Cerrar sesión');
    await user.click(logoutButton);

    expect(removeItemSpy).toHaveBeenCalledWith('user');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('It changes the language to Spanish ("es")', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );
    const langSelect = screen.getByRole('combobox');
    
    await user.selectOptions(langSelect, 'es');
    expect(mockSetLang).toHaveBeenCalledWith('es');
  });

  test('It changes the language to English', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );
    const langSelect = screen.getByRole('combobox');
    
    await user.selectOptions(langSelect, 'en');
    expect(mockSetLang).toHaveBeenCalledWith('en');
  });

  test('It changes the language to Italian', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );
    const langSelect = screen.getByRole('combobox');
    
    await user.selectOptions(langSelect, 'it');
    expect(mockSetLang).toHaveBeenCalledWith('it');
  });

  test('It changes the language to French', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );
    const langSelect = screen.getByRole('combobox');
    
    await user.selectOptions(langSelect, 'fr');
    expect(mockSetLang).toHaveBeenCalledWith('fr');
  });

  test('It changes the language to German', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );
    const langSelect = screen.getByRole('combobox');
    
    await user.selectOptions(langSelect, 'de');
    expect(mockSetLang).toHaveBeenCalledWith('de');
  });

  test('It applies the default case (Spanish) if it receives an unknown value', () => {
    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );
    const langSelect = screen.getByRole('combobox');
    
    fireEvent.change(langSelect, { target: { value: 'zh' } });
    expect(mockSetLang).toHaveBeenCalledWith('es');
  });

  test('It navigates to /configureGame when clicking "Jugar"', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar activeTab="stats" />
      </MemoryRouter>
    );
    
    await user.click(screen.getByText('jugar'));
    expect(mockNavigate).toHaveBeenCalledWith('/configureGame');
  });

  test('It navigates to /statistics when clicking "Estadísticas"', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar activeTab="help" />
      </MemoryRouter>
    );
    
    await user.click(screen.getByText('estadisticas'));
    expect(mockNavigate).toHaveBeenCalledWith('/statistics');
  });

  test('It navigates to /help when clicking "Ayuda"', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <NavBar activeTab="play" />
      </MemoryRouter>
    );
    
    await user.click(screen.getByText('ayuda'));
    expect(mockNavigate).toHaveBeenCalledWith('/help');
  });
});