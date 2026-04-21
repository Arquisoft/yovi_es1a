import React from 'react';

interface OpponentDisconnectedModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

const OpponentDisconnectedModal: React.FC<OpponentDisconnectedModalProps> = ({ isOpen, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        <h3>¡Tu oponente se ha desconectado!</h3>
        <p>Has ganado la partida.</p>
        <div className="custom-modal-buttons">
          <button className="btn-modal-confirm" onClick={onConfirm}>
            Ir a estadisticas 
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpponentDisconnectedModal;
