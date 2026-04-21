import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Clan from '../pages/Clan';
import { clanService } from '../services/clan.service';
import { describe, expect, test, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useClanChat } from '../hooks/useClanChat';
import ClanManager from '../pages/Clan';

vi.mock('../services/clan.service', () => ({
  clanService: {
    getAllClans: vi.fn(),
    createClan: vi.fn(),
    addMemberToClan: vi.fn(),
    getClanMessages: vi.fn(), 
    sendMessage: vi.fn(),
  },
}));

vi.mock('../hooks/useClanChat', () => ({
  useClanChat: vi.fn(),
}));

describe('Clan', () => {
  beforeAll(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost');
  });

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
      (useClanChat as any).mockReturnValue({
      messages: [],
      sendMessage: vi.fn(),
      loadingHistory: false
    });
  });
  afterAll(() => {
  vi.unstubAllEnvs();
});

  test('carga clanes existentes y los muestra', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
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
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
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
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
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
  sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
  
  (clanService.getAllClans as any).mockResolvedValue([{ clanId: 'c1', name: 'Clan1', members: ['u1'] }]);
  
  const mockSendMessage = vi.fn();
  (useClanChat as any).mockReturnValue({
    messages: [],
    sendMessage: mockSendMessage,
    loadingHistory: false
  });

  render(<MemoryRouter><ClanManager /></MemoryRouter>);
  const user = userEvent.setup();

  await waitFor(() => expect(screen.getByText(/Clan1/i)).toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: /Chat/i }));

  await user.type(screen.getByPlaceholderText(/Escribe un mensaje/i), 'Hola');
  await user.click(screen.getByRole('button', { name: /enviar/i }));

  expect(mockSendMessage).toHaveBeenCalledWith('Hola');
});

  test('error si falla fetch de clanes', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
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
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
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
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as any).mockResolvedValue([{ clanId: 'c1', name: 'Clan1', members: ['u1'] }]);
    
    (useClanChat as any).mockReturnValue({
      messages: [{ username: 'User2', text: 'Hola' }],
      sendMessage: vi.fn(),
      loadingHistory: false
    });

    render(<MemoryRouter><ClanManager /></MemoryRouter>);
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/Clan1/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /chat/i }));

    await waitFor(() => {
      expect(screen.getByText(/Hola/i)).toBeInTheDocument();
    });
  });

  test('carga clanes existentes y los muestra', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as any).mockResolvedValueOnce([
      { clanId: 'c1', name: 'Clan1', members: ['u1'] },
      { clanId: 'c2', name: 'Clan2', members: [] },
    ]);

    render(<MemoryRouter><ClanManager/></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Clan1/i)).toBeInTheDocument();
      expect(screen.getByText(/Clan2/i)).toBeInTheDocument();
    });
  });

  test('muestra mensajes existentes al abrir chat de clan (vía Hook)', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as any).mockResolvedValue([{ clanId: 'c1', name: 'Clan1', members: ['u1'] }]);
    
    // Simulamos que el hook ya tiene mensajes
    (useClanChat as any).mockReturnValue({
      messages: [{ username: 'User2', text: 'Hola desde Socket' }],
      sendMessage: vi.fn(),
      loadingHistory: false
    });

    render(<MemoryRouter><ClanManager /></MemoryRouter>);
    const user = userEvent.setup();

    await waitFor(() => expect(screen.getByText(/Clan1/i)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /chat/i }));

    // Verificamos que se muestra el mensaje que provee el Hook
    await waitFor(() => {
      expect(screen.getByText(/Hola desde Socket/i)).toBeInTheDocument();
    });
  });

  test('envía mensaje llamando a la función del Hook', async () => {
    sessionStorage.setItem('user', JSON.stringify({ userId: 'u1', username: 'User1' }));
    (clanService.getAllClans as any).mockResolvedValue([{ clanId: 'c1', name: 'Clan1', members: ['u1'] }]);
    
    const mockSendMessage = vi.fn();
    (useClanChat as any).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      loadingHistory: false
    });

    render(<MemoryRouter><ClanManager /></MemoryRouter>);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /chat/i }));
    await user.type(screen.getByPlaceholderText(/Escribe un mensaje/i), 'Mi mensaje socket');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    expect(mockSendMessage).toHaveBeenCalledWith('Mi mensaje socket');
  });

  test('muestra error si falla fetch de clanes', async () => {
    (clanService.getAllClans as any).mockRejectedValueOnce(new Error('Fail'));

    render(<MemoryRouter><ClanManager /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText(/Error cargando clanes/i)).toBeInTheDocument();
    });
  });

  test('muestra error si intenta crear clan sin estar logueado', async () => {
    (clanService.getAllClans as any).mockResolvedValue([]);
    render(<MemoryRouter><ClanManager /></MemoryRouter>);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/Nombre del clan/i), 'ClanSinUser');
    await user.click(screen.getByRole('button', { name: /crearClanBoton/i }));

    await waitFor(() => {
        expect(screen.getByText(/Debes iniciar sesión para unirte a un clan/i)).toBeInTheDocument();
    });
  });
});