import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import OpponentDisconnectedModal from '../components/OpponentDisconnectedModal';

describe('OpponentDisconnectedModal', () => {

  it('no debería renderizar nada cuando isOpen es false', () => {
    const { container } = render(
      <OpponentDisconnectedModal isOpen={false} onConfirm={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('debería mostrar el modal cuando isOpen es true', () => {
    render(
      <OpponentDisconnectedModal isOpen={true} onConfirm={() => {}} />
    );
    expect(screen.getByText('¡Tu oponente se ha desconectado!')).toBeInTheDocument();
  });

  it('debería llamar a onConfirm cuando se hace click en el botón', async () => {
    const mockOnConfirm = vi.fn();
    render(
      <OpponentDisconnectedModal isOpen={true} onConfirm={mockOnConfirm} />
    );
    
    const button = screen.getByRole('button', { name: /Ir a estadisticas/i });
    await userEvent.click(button);
    
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('debería renderizar todos los elementos del modal cuando isOpen es true', () => {
    render(
      <OpponentDisconnectedModal isOpen={true} onConfirm={() => {}} />
    );
    
    expect(screen.getByText('¡Tu oponente se ha desconectado!')).toBeInTheDocument();
    expect(screen.getByText('Has ganado la partida.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ir a estadisticas/i })).toBeInTheDocument();
  });

});