import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../pages/Register'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

describe('RegisterForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()//Evita que un test afecte al siguiente restaurando de cero
  })

  //Registrarse sin username, email ni password --> Mensaje: Please fill all fields
  test('shows validation error when username, email and password is empty', async () => {//Texto: lo que se comprueba
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )//render() monta el formulario. MemoryRouter se usa como un BrowserRouter pero para tests
    //Se necesita MemoryRouter para crear el contexto de Router en memoria, así useNavigate() funciona en el test. 

    const user = userEvent.setup()//Creo un usuario virtual de pruebas

    const button = screen.getByRole('button', { name: /lets go!/i })//screen (objeto que funciona como DOM donde esta el componente de render), getByRole('button', { name: /lets go!/i }) busca el boton. La i indica que no importa Mayus/Minus.
    await user.click(button)//Click en el botón
    
    await waitFor(() => {//Espera que algo ocurra en el DOM.
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registrarse sin username --> Mensaje: Please fill all fields
  test('registrarse sin username', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')//Asigno email. Uso email porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/contra/i), 'password123')//Asigno password. Uso contra porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registrarse sin email --> Mensaje: Please fill all fields
  test('registrarse sin email', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')//Asigno username. Uso user porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/contra/i), 'password123')//Asigno password. Uso contra porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registrarse sin password --> Mensaje: Please fill all fields
  test('registrarse sin password', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')//Asigno username. Uso user porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')//Asigno email. Uso email porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registrarse sin user ni email --> Mensaje: Please fill all fields
  test('registrarse sin user ni email', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/contra/i), 'password123')//Asigno password. Uso contra porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registrarse sin user ni password --> Mensaje: Please fill all fields
  test('registrarse sin user ni password', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')//Asigno email. Uso email porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registrarse sin email ni password --> Mensaje: Please fill all fields
  test('registrarse sin email ni password', async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')//Asigno username. Uso user porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Please fill all fields/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registro con contraseña de menos de tres caracteres
  test('registro con contraseña de menos de tres caracteres', async () => {
    // Mock fetch to resolve automatically
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Password must be at least 3 characters' }),
    } as Response)//Devuelvo aqui el error

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')//Asigno username. Uso user porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')//Asigno email. Uso email porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/contra/i), '3')//Asigno password. Uso contra porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 3 characters/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registro con email ya registrado
  test('Registro con email ya registrado', async () => {
    // Mock fetch to resolve automatically
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409, // Código
      json: async () => ({ error: 'Email already registered' }),
    } as Response)//Devuelvo aqui el error

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')//Asigno username. Uso user porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')//Asigno email. Uso email porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/contra/i), 'password123')//Asigno password. Uso contra porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Email already registered/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registro con username ya registrado
  test('Registro con username ya registrado', async () => {
    // Mock fetch to resolve automatically
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409, // Código
      json: async () => ({ error: 'Username already taken' }),
    } as Response)//Devuelvo aqui el error

    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')//Asigno username. Uso user porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')//Asigno email. Uso email porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/contra/i), 'password123')//Asigno password. Uso contra porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(screen.getByText(/Username already taken/i)).toBeInTheDocument()//Lo esperado que ocurra. Busca ese texto en el DOM generado.
    })
  })

  //Registro válido --> Mensaje: User successfully created
  test('submits username and displays response', async () => {
    // Mock fetch to resolve automatically
    global.fetch = vi.fn().mockResolvedValueOnce({//Es lo que devolvería el fetch de la clase de register
      ok: true,
      json: async () => ({ message: 'User successfully created' }), 
    } as Response)//Simula una respuesta exitosa de un servidor. Cuando el componente lo llame no va a hacer una petición real, sino que devolverá inmediatamente una respuesta simulada
    
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});//Esto reemplaza el comportamiento real de alert y bloquea el alert real    
    
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/user/i), 'Pablo')//Asigno username. Uso user porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')//Asigno email. Uso email porque es la clave del texto internacionalizado.
    await user.type(screen.getByLabelText(/contra/i), 'password123')//Asigno password. Uso contra porque es la clave del texto internacionalizado.
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))//Click en el botón

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('¡Usuario registrado correctamente!');
    })
  })
})