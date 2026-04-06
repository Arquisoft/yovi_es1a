import React from 'react';
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

interface SurrenderModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SurrenderModal: React.FC<SurrenderModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="custom-modal-overlay">
      <div className="custom-modal-content">
        {}
        <h3>{t("confirmSurrender") || "¿Estás seguro de que quieres rendirte?"}</h3>
        
        {}
        <p>Perderás la partida automáticamente.</p>
        
        <div className="custom-modal-buttons">
          <button className="btn-modal-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-modal-confirm" onClick={onConfirm}>
            Sí, rendirme
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurrenderModal;