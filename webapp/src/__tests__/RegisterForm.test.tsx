import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '../pages/Register'
import { afterEach, describe, expect, test, vi } from 'vitest' 
import '@testing-library/jest-dom'

describe('RegisterForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('shows validation error when username is empty', async () => {
    render(<RegisterForm />)
    const user = userEvent.setup()

    const button = screen.getByRole('button', { name: /lets go!/i })
    await user.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a username/i)).toBeInTheDocument()
    })
  })

  test('submits username and displays response', async () => {
    // Mock fetch to resolve automatically
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User successfully created' }), 
    } as Response)

    render(<RegisterForm />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/username/i), 'Pablo')
    await user.type(screen.getByLabelText(/email/i), 'pablo@test.com')      
    await user.type(screen.getByLabelText(/password/i), 'password123')      
    
    await user.click(screen.getByRole('button', { name: /lets go!/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/user successfully created/i)  
      ).toBeInTheDocument()
    })
  })
})