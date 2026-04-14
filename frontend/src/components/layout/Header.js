import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Bell } from 'lucide-react';

const PAGE_META = {
  '/dashboard':     { title: 'Dashboard',     subtitle: 'Your gym at a glance' },
  '/members':       { title: 'Members',       subtitle: 'Manage memberships & profiles' },
  '/attendance':    { title: 'Attendance',    subtitle: 'Track daily check-ins & reports' },
  '/subscriptions': { title: 'Subscriptions', subtitle: 'Plans, payments & renewals' },
  '/trainers':      { title: 'Trainers',      subtitle: 'Staff & schedule management' },
  '/notifications': { title: 'Notifications', subtitle: 'Alerts & announcements' },
};

export default function Header() {
  const { unreadCount } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { title: 'FytNodes', subtitle: '' };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  return (
    <header style={S.header}>
      {/* Left accent bar */}
      <div style={S.accentBar} />

      <div style={S.left}>
        <div style={S.titleWrap}>
          <h1 style={S.title}>{meta.title}</h1>
          <p style={S.sub}>{meta.subtitle}</p>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.datePill}>{today}</div>

        <button style={S.notifBtn} onClick={() => navigate('/notifications')}>
          <Bell size={17} />
          {unreadCount > 0 && <span style={S.notifDot}>{unreadCount}</span>}
        </button>
      </div>
    </header>
  );
}

const S = {
  header: {
    height: 'var(--header-height)',
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    position: 'sticky', top: 0, zIndex: 50,
    gap: 16,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 1,
    background: 'linear-gradient(90deg, var(--red) 0%, transparent 40%)',
    opacity: 0.6,
  },
  left: { display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 },
  titleWrap: {},
  title: {
    fontSize: 17, fontWeight: 800, color: 'var(--text-primary)',
    letterSpacing: '-0.3px', lineHeight: 1.2,
  },
  sub: { fontSize: 11, color: 'var(--text-muted)', marginTop: 1, fontWeight: 500 },
  right: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  datePill: {
    fontSize: 12, color: 'var(--text-muted)',
    background: 'var(--bg-elevated)',
    padding: '5px 12px',
    borderRadius: 20,
    border: '1px solid var(--border-soft)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  notifBtn: {
    position: 'relative',
    width: 36, height: 36,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-soft)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'all 0.18s',
  },
  notifDot: {
    position: 'absolute', top: -5, right: -5,
    background: 'var(--red)',
    color: '#fff',
    fontSize: 9, fontWeight: 800,
    width: 17, height: 17,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid var(--bg-card)',
  },
};
