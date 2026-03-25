import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Clan from '../pages/Clan';
import { clanService } from '../services/clan.service';
import { describe, expect, test, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../services/clan.service', () => ({
  clanService: {
    getAllClans: vi.fn(),
    createClan: vi.fn(),
    addMemberToClan: vi.fn(),
    getClanMessages: vi.fn(),
    sendMessage: vi.fn(),
  },
}));

describe('Clan', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('carga clanes existentes y los muestra', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { clanId: 'c1', name: 'Clan1', members: ['u1'] },
      { clanId: 'c2', name: 'Clan2', members: [] },
    ]);

    render(<MemoryRouter><Clan/></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Clan1/i)).toBeInTheDocument();//La i ignora mayusculas o minusculas
      expect(screen.getByText(/Clan2/i)).toBeInTheDocument();
    });
  });

  test('crear un nuevo clan', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.createClan as ReturnType<typeof vi.fn>).mockResolvedValueOnce({});
    (clanService.getAllClans as ReturnType<typeof vi.fn>)
    .mockResolvedValueOnce([])//Render inicial
    .mockResolvedValueOnce([{ clanId: 'c1', name: 'NuevoClan', members: ['u1'] }]);//Después de crear

    render(<MemoryRouter><Clan /></MemoryRouter>);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/Nombre del clan/i), 'NuevoClan');
    await user.click(await screen.getByRole('button', { name: /crearClanBoton/i }));

    await waitFor(() => {
      expect(screen.getByText(/NuevoClan/i)).toBeInTheDocument();
    });
  });

  test('unirse a un clan existente', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockResolvedValue([
      { clanId: 'c1', name: 'ClanExistente', members: [] },
    ]);
    (clanService.addMemberToClan as ReturnType<typeof vi.fn>).mockResolvedValue({});
    
    render(<MemoryRouter><Clan /></MemoryRouter>);
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/ClanExistente/i)).toBeInTheDocument());
    await user.click(await screen.getByRole('button', { name: /unirme/i }));

    await waitFor(() => {
      expect(clanService.addMemberToClan).toHaveBeenCalledWith('c1', 'u1');
    });
  });

  test('envía mensaje en chat del clan', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockResolvedValue([
      { clanId: 'c1', name: 'Clan1', members: ['u1'] },
    ]);
    (clanService.getClanMessages as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (clanService.sendMessage as ReturnType<typeof vi.fn>).mockResolvedValue([
      { username: 'User1', text: 'Hola' },
    ]);

    render(<MemoryRouter><Clan /></MemoryRouter>);
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/Clan1/i)).toBeInTheDocument());
    await user.click(await screen.getByRole('button', { name: /Chat/i }));

    await user.type(screen.getByPlaceholderText(/Escribe un mensaje/i), 'Hola');
    await user.click(await screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Hola/i)).toBeInTheDocument();
      expect(clanService.sendMessage).toHaveBeenCalledWith('c1', 'u1', 'User1', 'Hola');
    });
  });

  test('error si falla fetch de clanes', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Error'));

    render(<MemoryRouter><Clan /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Error cargando clanes/i)).toBeInTheDocument();
    });
  });

  test('mostrar error si intenta crear clan sin estar logueado', async () => {
    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    render(<MemoryRouter><Clan /></MemoryRouter>);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/Nombre del clan/i), 'ClanSinUser');
    await user.click(await screen.getByRole('button', { name: /crearClanBoton/i }));

    await waitFor(() => {
        expect(screen.getByText(/Debes iniciar sesión para unirte a un clan/i)).toBeInTheDocument();
    });
  });

  test('mostrar error si intenta unirse a un clan sin estar logueado', async () => {
    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockResolvedValue([
        { clanId: 'c1', name: 'Clan1', members: [] },
    ]);

    render(<MemoryRouter><Clan /></MemoryRouter>);
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/Clan1/i)).toBeInTheDocument());
    await user.click(await screen.getByRole('button', { name: /unirme/i }));

    await waitFor(() => {
        expect(screen.getByText(/Debes iniciar sesión para unirte a un clan/i)).toBeInTheDocument();
    });
  });

  test('no envía mensaje si el input está vacío', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockResolvedValue([
        { clanId: 'c1', name: 'Clan1', members: ['u1'] },
    ]);
    (clanService.getClanMessages as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(<MemoryRouter><Clan /></MemoryRouter>);
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/Clan1/i)).toBeInTheDocument());
    await user.click(await screen.getByRole('button', { name: /Chat/i }));

    await user.click(await screen.getByRole('button', { name: /enviar/i }));
    await waitFor(() => {
        expect(clanService.sendMessage).not.toHaveBeenCalled();
    });
  });

  test('muestra mensajes existentes al abrir chat de clan', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockResolvedValue([
        { clanId: 'c1', name: 'Clan1', members: ['u1'] },
    ]);
    (clanService.getClanMessages as ReturnType<typeof vi.fn>).mockResolvedValue([
        { username: 'User2', text: 'Hola' },
    ]);

    render(<MemoryRouter><Clan /></MemoryRouter>);
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/Clan1/i)).toBeInTheDocument());
    await user.click(await screen.getByRole('button', { name: /chat/i }));

    await waitFor(() => {
        expect(screen.getByText(/Hola/i)).toBeInTheDocument();
    });
  });

  test('muestra error si falla al crear clan', async () => {
    localStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));

    (clanService.getAllClans as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (clanService.createClan as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Error'));

    render(<MemoryRouter><Clan /></MemoryRouter>);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/Nombre del clan/i), 'ClanError');
    await user.click(screen.getByRole('button', { name: /crearClanBoton/i }));

    await waitFor(() => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });


});