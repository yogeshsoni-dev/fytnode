import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCheck,
  CreditCard,
  Megaphone,
  Plus,
  UserCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { notificationsApi } from '../../api/notifications.api';
import { getErrorMessage } from '../../utils/formatters';
import ErrorState from '../shared/ErrorState';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

const TYPE_META = {
  renewal: { icon: CreditCard, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Renewal' },
  payment: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Payment' },
  announcement: { icon: Megaphone, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Announcement' },
  trainer: { icon: UserCheck, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', label: 'Trainer' },
};

const PRIORITY_STYLE = {
  high: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'HIGH' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'MED' },
  low: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', label: 'LOW' },
};

export default function Notifications() {
  const { state, refreshUnread } = useApp();
  const isAdmin = state.currentUser?.role === 'ADMIN';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: 'announcement',
    title: '',
    message: '',
    priority: 'low',
  });

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await notificationsApi.getAll({ limit: 100 });
      setNotifications(res.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((notification) => !notification.read);
    if (filter === 'read') return notifications.filter((notification) => notification.read);
    return notifications;
  }, [filter, notifications]);

  const unread = notifications.filter((notification) => !notification.read).length;

  const typeCounts = useMemo(() => {
    return Object.keys(TYPE_META).reduce((acc, key) => {
      acc[key] = notifications.filter((notification) => notification.type === key).length;
      return acc;
    }, {});
  }, [notifications]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      setSaveError('Title and message are required.');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const created = await notificationsApi.create(form);
      setNotifications((prev) => [created, ...prev]);
      setForm({ type: 'announcement', title: '', message: '', priority: 'low' });
      setShowModal(false);
      refreshUnread();
    } catch (createError) {
      setSaveError(getErrorMessage(createError));
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
      refreshUnread();
    } catch (markAllError) {
      setError(getErrorMessage(markAllError));
    }
  };

  const handleMarkRead = async (notification) => {
    if (notification.read) return;

    try {
      const updated = await notificationsApi.markRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      refreshUnread();
    } catch (markReadError) {
      setError(getErrorMessage(markReadError));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">{unread} unread | {notifications.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {unread > 0 && (
            <button className="btn btn-secondary" onClick={handleMarkAllRead}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={14} /> New Notification
            </button>
          )}
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {Object.entries(TYPE_META).map(([type, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={type} className="stat-card" style={{ '--accent-color': meta.color }}>
              <div className="stat-icon" style={{ background: meta.bg }}>
                <Icon size={17} color={meta.color} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{typeCounts[type] || 0}</div>
                <div className="stat-label">{meta.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread${unread > 0 ? ` (${unread})` : ''}` },
          { key: 'read', label: 'Read' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={loadNotifications} />
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <BellOff size={36} />
          <h3>No notifications here</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((notification) => {
            const meta = TYPE_META[notification.type] || TYPE_META.announcement;
            const Icon = meta.icon;
            const priority = PRIORITY_STYLE[notification.priority] || PRIORITY_STYLE.low;

            return (
              <div
                key={notification.id}
                onClick={() => handleMarkRead(notification)}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  padding: '15px 18px',
                  background: notification.read ? 'var(--bg-card)' : 'var(--bg-card2)',
                  border: `1px solid ${notification.read ? 'var(--border)' : 'var(--border-soft)'}`,
                  borderLeft: `3px solid ${notification.read ? 'var(--border)' : meta.color}`,
                  borderRadius: 'var(--radius)',
                  cursor: notification.read ? 'default' : 'pointer',
                  transition: 'all 0.18s',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    background: meta.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={meta.color} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: notification.read ? 'var(--text-secondary)' : '#fff',
                        marginBottom: 4,
                      }}
                    >
                      {notification.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: 3,
                          background: priority.bg,
                          color: priority.color,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {priority.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {notification.date}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {notification.message}
                  </p>

                  {!notification.read && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        marginTop: 8,
                        fontSize: 11,
                        color: meta.color,
                        fontWeight: 600,
                      }}
                    >
                      <Zap size={10} fill={meta.color} /> Click to mark as read
                    </div>
                  )}
                </div>

                {!notification.read && (
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: meta.color,
                      flexShrink: 0,
                      marginTop: 5,
                      boxShadow: `0 0 6px ${meta.color}`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Notification">
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {saveError && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--danger-faint)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--danger)',
                  fontSize: 13,
                }}
              >
                {saveError}
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-input"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  {Object.entries(TYPE_META).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-input"
                  value={form.priority}
                  onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Notification title..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea
                className="form-input"
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Notification message..."
                rows={3}
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
                paddingTop: 6,
                borderTop: '1px solid var(--border)',
                marginTop: 4,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Sending...' : (
                  <>
                    <Bell size={13} /> Send
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
