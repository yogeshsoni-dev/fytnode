import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Failed to load data', onRetry }) {
  return (
    <div className="empty-state card" style={{ gap: 12 }}>
      <AlertCircle size={32} color="var(--danger)" style={{ opacity: 1 }} />
      <h3 style={{ color: 'var(--danger)' }}>Error</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} style={{ marginTop: 4 }}>
          <RefreshCw size={13} /> Retry
        </button>
      )}
    </div>
  );
}
