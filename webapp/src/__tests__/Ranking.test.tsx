import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, beforeEach, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import Ranking from '../pages/Ranking';
import { statsService } from '../services/stats.service';
import * as ReactRouter from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock('../services/stats.service', () => ({
  statsService: {
    getRanking: vi.fn(),
    getClanRanking: vi.fn(),
  },
}));

vi.mock('../components/NavBar', () => ({
  default: () => <div data-testid="navbar-mock">NavBar</div>,
}));

// Mock del video para evitar errores en jsdom
vi.mock('../assets/videoLinea.mp4', () => ({
  default: 'mocked-video.mp4',
}));

describe('Ranking Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ReactRouter.useParams).mockReturnValue({ type: 'players' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('fetches and displays the players ranking successfully', async () => {
    const mockPlayers = [
      { _id: '1', username: 'PlayerOne', totalMatches: 10, wins: 7, losses: 3, winRate: 70.0 },
    ];
    vi.mocked(statsService.getRanking).mockResolvedValueOnce(mockPlayers);

    render(
      <MemoryRouter>
        <Ranking />
      </MemoryRouter>
    );

    expect(screen.getByText(/ce/i)).toBeInTheDocument();
    expect(screen.getByText('rankJugadores')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('PlayerOne')).toBeInTheDocument();
      expect(screen.getByText('70.0%')).toBeInTheDocument();
    });

    expect(statsService.getRanking).toHaveBeenCalledTimes(1);
    expect(statsService.getClanRanking).not.toHaveBeenCalled();
  });

  test('fetches and displays the clans ranking successfully', async () => {
    vi.mocked(ReactRouter.useParams).mockReturnValue({ type: 'clans' });
    const mockClans = [
      { _id: '1', name: 'AlphaClan', totalMatches: 20, wins: 15, losses: 5, winRate: 75.0 },
    ];
    vi.mocked(statsService.getClanRanking).mockResolvedValueOnce(mockClans);

    render(
      <MemoryRouter>
        <Ranking />
      </MemoryRouter>
    );

    expect(screen.getByText('rankGlobalClanes')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('AlphaClan')).toBeInTheDocument();
      expect(screen.getByText('75.0%')).toBeInTheDocument();
    });

    expect(statsService.getClanRanking).toHaveBeenCalledTimes(1);
    expect(statsService.getRanking).not.toHaveBeenCalled();
  });

  test('displays an empty state message when the ranking array is empty', async () => {
    vi.mocked(statsService.getRanking).mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <Ranking />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/noData/i)).toBeInTheDocument();
    });
  });

  test('logs an error to the console and stops loading if the API call fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(statsService.getRanking).mockRejectedValueOnce(new Error('Network Error'));

    render(
      <MemoryRouter>
        <Ranking />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error al obtener el ranking real:', expect.any(Error));
    });

    expect(screen.queryByText(/Cargando estadísticas/i)).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  test('sorts scrambled data to cover all inner sorting algorithm branches including asc and desc orders', async () => {
    const user = userEvent.setup();
    const scrambledMockPlayers = [
      { _id: '1', username: 'A', totalMatches: 10, wins: 50, losses: 5, winRate: 50 },
      { _id: '2', username: 'B', totalMatches: 10, wins: 10, losses: 5, winRate: 10 },
      { _id: '3', username: 'C', totalMatches: 10, wins: 80, losses: 2, winRate: 80 },
      { _id: '4', username: 'D', totalMatches: 10, wins: 30, losses: 2, winRate: 30 },
      { _id: '5', username: 'E', totalMatches: 10, wins: 90, losses: 2, winRate: 90 },
      { _id: '6', username: 'F', totalMatches: 10, wins: 10, losses: 5, winRate: 10 },
    ];
    vi.mocked(statsService.getRanking).mockResolvedValueOnce(scrambledMockPlayers);

    render(
      <MemoryRouter>
        <Ranking />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, 'winRate');
    expect(sortSelect).toHaveValue('winRate');

    const sortButton = screen.getByRole('button', { name: /mayAmen/i });
    await user.click(sortButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /menAmay/i })).toBeInTheDocument();
    });

    const ascButton = screen.getByRole('button', { name: /menAmay/i });
    await user.click(ascButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mayAmen/i })).toBeInTheDocument();
    });
  });

  test('paginates the items correctly when the total exceeds the items per page limit', async () => {
    const user = userEvent.setup();
    const mockPlayers = Array.from({ length: 6 }).map((_, index) => ({
      _id: String(index),
      username: `Player${index + 1}`,
      totalMatches: 10,
      wins: 5,
      losses: 5,
      winRate: 50,
    }));
    vi.mocked(statsService.getRanking).mockResolvedValueOnce(mockPlayers);

    render(
      <MemoryRouter>
        <Ranking />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('pag 1 dePag 2')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /sig/i });
    const prevButton = screen.getByRole('button', { name: /ant/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('pag 2 dePag 2')).toBeInTheDocument();
    });
    expect(nextButton).toBeDisabled();
    expect(prevButton).not.toBeDisabled();

    await user.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText('pag 1 dePag 2')).toBeInTheDocument();
    });
  });
});
