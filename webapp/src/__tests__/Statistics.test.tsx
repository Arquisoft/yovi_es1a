import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Estadisticas from '../pages/Statistics'; 
import { statsService } from '../services/stats.service';

import { describe, expect, test, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('../services/stats.service.ts', () => ({
  statsService: {
    getMatchHistory: vi.fn(),
  },
}));

vi.mock('../components/NavBar.tsx', () => ({
    default: () => <div data-testid="navbar-mock">NavBar</div>
}));

vi.mock('../idiomaConf/LanguageContext.tsx', () => ({
  useLanguage: () => ({
    t: (key: string) => key, 
  }),
}));

describe('Estadisticas Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  test('displays an error message when no user is found in localStorage', () => {
    render(
      <MemoryRouter>
        <Estadisticas />
      </MemoryRouter>
    );
    
    expect(screen.getByText('No hay usuario conectado. Inicia sesión para ver tus estadísticas.')).toBeInTheDocument();
  });

  test('displays loading state followed by empty state when match history is empty', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'user123', username: 'TestUser' }));
    
    (statsService.getMatchHistory as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      content: [],
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <Estadisticas />
      </MemoryRouter>
    );

    expect(screen.getByText('cargandoPartidas')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ceroPartidas')).toBeInTheDocument();
    });
  });

  test('renders the match history table correctly with provided data', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'user123', username: 'TestUser' }));
    
    const mockHistory = [
      { _id: '1', result: 'win', opponent: 'random_bot', totalMoves: 10, duration: 60, boardSize: 5, createdAt: '2023-01-01T10:00:00Z' },
      { _id: '2', result: 'lose', opponent: 'smart_bot', totalMoves: 15, duration: 120, boardSize: 5, createdAt: '2023-01-02T15:30:00Z' }
    ];
    (statsService.getMatchHistory as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      content: mockHistory,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <Estadisticas />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('WIN')).toBeInTheDocument();
      expect(screen.getByText('LOSE')).toBeInTheDocument();
      expect(screen.getByText('random_bot')).toBeInTheDocument();
      expect(screen.getByText('smart_bot')).toBeInTheDocument();
      expect(screen.getByText('60 s')).toBeInTheDocument();
    });
  });

  test('handles server errors with specific error messages', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'user123' }));
    
    (statsService.getMatchHistory as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Fallo crítico en la BD'));

    render(
      <MemoryRouter>
        <Estadisticas />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Fallo crítico en la BD')).toBeInTheDocument();
    });
  });

  test('handles generic server errors', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'user123' }));
    
    (statsService.getMatchHistory as ReturnType<typeof vi.fn>).mockRejectedValueOnce({});

    render(
      <MemoryRouter>
        <Estadisticas />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Error al cargar las estadísticas.')).toBeInTheDocument();
    });
  });

  test('updates filter states and reloads history when inputs change', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('user', JSON.stringify({ userId: 'user123' }));
    
    const mockGetHistory = statsService.getMatchHistory as ReturnType<typeof vi.fn>;
    mockGetHistory.mockResolvedValue({ content: [], totalPages: 1 });

    render(
      <MemoryRouter>
        <Estadisticas />
      </MemoryRouter>
    );

    await waitFor(() => expect(mockGetHistory).toHaveBeenCalledTimes(1));

    const resultSelect = screen.getByRole('combobox');
    const durationInput = screen.getByPlaceholderText('durMax');
    const movesInput = screen.getByPlaceholderText('movesMax');

    await user.selectOptions(resultSelect, 'win');
    await user.type(durationInput, '50');
    await user.type(movesInput, '20');

    await waitFor(() => {
      expect(mockGetHistory).toHaveBeenLastCalledWith('user123', 1, 5, expect.objectContaining({
        result: 'win',
        maxDuration: 50,
        maxMoves: 20
      }));
    });
  });

  test('navigates between pages correctly using pagination buttons', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('user', JSON.stringify({ userId: 'user123' }));
    
    const mockGetHistory = statsService.getMatchHistory as ReturnType<typeof vi.fn>;
    mockGetHistory.mockResolvedValue({ content: [], totalPages: 3 });

    render(
      <MemoryRouter>
        <Estadisticas />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('pag 1 dePag 3')).toBeInTheDocument();
    });

    const btnSiguiente = screen.getByText('sig');
    const btnAnterior = screen.getByText('ant');

    await user.click(btnSiguiente);
    await waitFor(() => {
      expect(screen.getByText('pag 2 dePag 3')).toBeInTheDocument();
      expect(mockGetHistory).toHaveBeenLastCalledWith('user123', 2, 5, expect.any(Object));
    });

    await user.click(btnAnterior);
    await waitFor(() => {
      expect(screen.getByText('pag 1 dePag 3')).toBeInTheDocument();
      expect(mockGetHistory).toHaveBeenLastCalledWith('user123', 1, 5, expect.any(Object));
    });
  });
});