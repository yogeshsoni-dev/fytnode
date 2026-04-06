import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <AlertTriangle size={24} color={danger ? 'var(--danger)' : 'var(--warning)'} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            style={danger ? { background: 'var(--danger)', color: 'white' } : {}}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
