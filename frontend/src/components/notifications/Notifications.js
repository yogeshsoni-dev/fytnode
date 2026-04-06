import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, BellOff, CreditCard, Megaphone, UserCheck, CheckCheck, Plus, AlertCircle, Zap } from 'lucide-react';
import Modal from '../shared/Modal';

const TYPE_META = {
  renewal:      { icon: CreditCard,  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Renewal' },
  payment:      { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Payment' },
  announcement: { icon: Megaphone,   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  label: 'Announcement' },
  trainer:      { icon: UserCheck,   color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  label: 'Trainer' },
};

const PRIORITY_STYLE = {
  high:   { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', label: 'HIGH' },
  medium: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'MED'  },
  low:    { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6', label: 'LOW'  },
};

export default function Notifications() {
  const { state, dispatch } = useApp();
  const { notifications } = state;

  const [filter, setFilter] = useState('all');
  const [showModal, setModal] = useState(false);
  const [form, setForm] = useState({ type: 'announcement', title: '', message: '', priority: 'low' });

  const filtered = notifications.filter(n =>
    filter === 'all'    ? true :
    filter === 'unread' ? !n.read :
    n.read
  );

  const unread = notifications.filter(n => !n.read).length;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { id: Date.now(), ...form, date: new Date().toISOString().split('T')[0], read: false },
    });
    setForm({ type: 'announcement', title: '', message: '', priority: 'low' });
    setModal(false);
  };

  const typeCounts = Object.keys(TYPE_META).reduce((acc, k) => {
    acc[k] = notifications.filter(n => n.type === k).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">{unread} unread · {notifications.length} total</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {unread > 0 && (
            <button className="btn btn-secondary" onClick={() => dispatch({ type: 'MARK_ALL_READ' })}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <Plus size={14} /> New Notification
          </button>
        </div>
      </div>

      {/* Type summary cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {Object.entries(TYPE_META).map(([type, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={type} className="stat-card" style={{ '--accent-color': meta.color }}>
              <div className="stat-icon" style={{ background: meta.bg }}><Icon size={17} color={meta.color} /></div>
              <div className="stat-info">
                <div className="stat-value">{typeCounts[type]}</div>
                <div className="stat-label">{meta.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="tabs">
        {[
          { key: 'all',    label: 'All' },
          { key: 'unread', label: `Unread${unread > 0 ? ` (${unread})` : ''}` },
          { key: 'read',   label: 'Read' },
        ].map(({ key, label }) => (
          <button key={key} className={`tab-btn ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <BellOff size={36} />
          <h3>No notifications here</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(notif => {
            const meta = TYPE_META[notif.type] || TYPE_META.announcement;
            const Icon = meta.icon;
            const pri  = PRIORITY_STYLE[notif.priority] || PRIORITY_STYLE.low;

            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notif.id })}
                style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '15px 18px',
                  background: notif.read ? 'var(--bg-card)' : 'var(--bg-card2)',
                  border: `1px solid ${notif.read ? 'var(--border)' : 'var(--border-soft)'}`,
                  borderLeft: `3px solid ${notif.read ? 'var(--border)' : meta.color}`,
                  borderRadius: 'var(--radius)',
                  cursor: notif.read ? 'default' : 'pointer',
                  transition: 'all 0.18s',
                }}
              >
                {/* Type icon */}
                <div style={{ width: 38, height: 38, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} color={meta.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <h4 style={{
                      fontSize: 13, fontWeight: 800,
                      color: notif.read ? 'var(--text-secondary)' : '#fff',
                      marginBottom: 4,
                    }}>
                      {notif.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 3, background: pri.bg, color: pri.color, letterSpacing: '0.06em' }}>
                        {pri.label}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{notif.date}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>{notif.message}</p>

                  {!notif.read && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 11, color: meta.color, fontWeight: 600 }}>
                      <Zap size={10} fill={meta.color} /> Click to mark as read
                    </div>
                  )}
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0, marginTop: 5, boxShadow: `0 0 6px ${meta.color}` }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showModal} onClose={() => setModal(false)} title="Create Notification">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title…" />
          </div>
          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              className="form-input"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Notification message…"
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary"><Bell size={13} /> Send</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
