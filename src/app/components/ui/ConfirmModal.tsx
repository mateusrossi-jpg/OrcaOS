import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="aferix-modal-overlay">
      <div className="aferix-modal-content">
        <div className="aferix-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="aferix-modal-body">
          <p>{message}</p>
        </div>
        <div className="aferix-modal-footer">
          <button className="secondary-action" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button 
            className={tone === 'danger' ? 'danger-action' : 'primary-action'} 
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
