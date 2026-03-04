import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../pages/Login'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

describe('LoginForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()//Evita que un test afecte al siguiente restaurando de cero
  })

  //Login sin username ni password --> Mensaje: Please enter username and password
  test('Login sin username ni password', async () => {//Texto: lo que se comprueba
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    )//render() monta el formulario. MemoryRouter se usa como un BrowserRouter pero para tests
    //Se necesita MemoryRouter para crear el contexto de Router en memoria, así useNavigate() funciona en el test. 

    const user = userEvent.setup()//Creo un usuario virtual de pruebas

    const button = screen.getByRole('button', { name: /log in!/i });
    //screen (objeto que funciona como DOM donde esta el componente de render), getByRole('button', { name: /lets go!/i }) busca el boton. La i indica que no importa Mayus/Minus.
    await user.click(button)//Click en el botón
    
    await waitFor(() => {//Espera que algo ocurra en el DOM.
      expect(screen.getByText(/Please enter username and password/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Login sin username
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

  //Login sin contraseña
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

  //Login con credenciales incorrectas
  test('login con credenciales incorrectas', async () => {
    // Mock fetch para simular login fallido
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,//Simula el error
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

  //Login con credenciales correctas
  test('login con credenciales correctas', async () => {
    // Mock fetch para login exitoso
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ userId: '1', username: 'Pablo' }),
    } as Response);//Simula la petición

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

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
      expect(alertMock).toHaveBeenCalledWith('¡Bienvenido de nuevo, Pablo!');
    });
  });

})