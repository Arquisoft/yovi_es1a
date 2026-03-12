import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Estadisticas from '../pages/Statistics'; 
import { statsService } from '../services/stats.service';

import { describe, expect, test, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

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

describe('Componente Estadisticas', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('Muestra error si no hay usuario en localStorage', () => {
    render(
      <MemoryRouter>
        <Estadisticas />
      </MemoryRouter>
    );
    
    expect(screen.getByText('No hay usuario conectado. Inicia sesión para ver tus estadísticas.')).toBeInTheDocument();
  });

  test('Muestra estado de carga y luego cero partidas si el historial está vacío', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'user123', username: 'TestUser' }));
    
    (statsService.getMatchHistory as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      content: [],
      page: 1,
      size: 5,
      totalElements: 0,
      totalPages: 0
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

  test('Muestra la tabla con el historial de partidas correctamente', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'user123', username: 'TestUser' }));
    
    const mockHistory = [
      { _id: '1', result: 'win', opponent: 'random_bot', totalMoves: 10, duration: 60, boardSize: 5, createdAt: '2023-01-01T10:00:00Z' },
      { _id: '2', result: 'lose', opponent: 'smart_bot', totalMoves: 15, duration: 120, boardSize: 5, createdAt: '2023-01-02T15:30:00Z' }
    ];
    
    (statsService.getMatchHistory as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      content: mockHistory,
      page: 1,
      size: 5,
      totalElements: 2,
      totalPages: 1
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

  test('Maneja un error del servidor con mensaje específico', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'user123' }));
    
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

  test('Maneja un error genérico del servidor', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'user123' }));
    
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
});