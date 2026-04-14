import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'TRAINER', 'MEMBER'] },
  { to: '/members', icon: Users, label: 'Members', roles: ['ADMIN', 'TRAINER'] },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['ADMIN', 'TRAINER', 'MEMBER'] },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions', roles: ['ADMIN', 'TRAINER', 'MEMBER'] },
  { to: '/trainers', icon: UserCheck, label: 'Trainers', roles: ['ADMIN'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['ADMIN', 'TRAINER', 'MEMBER'] },
];

const ROLE_BADGE = {
  ADMIN: { bg: 'rgba(37,99,235,0.15)', color: 'var(--red)', label: 'ADMIN' },
  TRAINER: { bg: 'rgba(245,158,11,0.12)', color: 'var(--warning)', label: 'TRAINER' },
  MEMBER: { bg: 'rgba(34,197,94,0.1)', color: 'var(--success)', label: 'MEMBER' },
};

const AVATAR_COLORS = {
  ADMIN: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  TRAINER: 'linear-gradient(135deg, #f59e0b, #b45309)',
  MEMBER: 'linear-gradient(135deg, #22c55e, #15803d)',
};

export default function Sidebar() {
  const { state, logout, unreadCount } = useApp();
  const { currentUser } = state;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = NAV.filter((item) => item.roles.includes(currentUser?.role));
  const roleMeta = ROLE_BADGE[currentUser?.role] || ROLE_BADGE.MEMBER;
  const avatarBackground = AVATAR_COLORS[currentUser?.role] || AVATAR_COLORS.MEMBER;

  return (
    <aside style={S.sidebar}>
      <div style={S.brand}>
        <div style={S.brandIcon}>
          <Zap size={18} color="#fff" fill="#fff" />
        </div>
        <div>
          <span style={S.brandName}>FYTNODES</span>
          <span style={S.brandSub}>GMS</span>
        </div>
      </div>

      <div style={S.topDivider} />

      <div style={S.userCard}>
        <div style={{ ...S.userAvatar, background: avatarBackground }}>
          {currentUser?.name?.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.userName}>{currentUser?.name}</div>
          <span style={{ ...S.roleBadge, background: roleMeta.bg, color: roleMeta.color }}>
            {roleMeta.label}
          </span>
        </div>
      </div>

      <div style={S.navLabel}>NAVIGATION</div>

      <nav style={S.nav}>
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              ...S.navItem,
              ...(isActive ? S.navItemActive : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ ...S.navIconBox, ...(isActive ? S.navIconActive : {}) }}>
                  <Icon size={16} />
                </span>
                <span style={S.navLabel2}>{label}</span>
                {label === 'Notifications' && unreadCount > 0 && <span style={S.badge}>{unreadCount}</span>}
                {isActive && <span style={S.activeLine} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={S.footer}>
        <div style={S.topDivider} />
        <button onClick={handleLogout} style={S.logoutBtn}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
        <p style={S.version}>FytNodes | v1.0</p>
      </div>
    </aside>
  );
}

const S = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: 'var(--sidebar-width)',
    background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '22px 20px 18px',
  },
  brandIcon: {
    width: 36,
    height: 36,
    background: 'var(--red)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px var(--red-glow-sm)',
    flexShrink: 0,
  },
  brandName: {
    fontSize: 17,
    fontWeight: 900,
    color: 'var(--text-primary)',
    letterSpacing: '0.18em',
    marginRight: 6,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: 700,
    color: 'var(--red)',
    letterSpacing: '0.1em',
  },
  topDivider: { height: 1, background: 'var(--border)', margin: '0 16px' },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 16px',
    margin: '14px 12px',
    background: 'var(--bg-elevated)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-soft)',
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 800,
    color: '#fff',
    flexShrink: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: 3,
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: 9,
    fontWeight: 800,
    padding: '2px 7px',
    borderRadius: 3,
    letterSpacing: '0.1em',
  },
  navLabel: {
    fontSize: 9,
    fontWeight: 800,
    color: 'var(--text-faint)',
    letterSpacing: '0.14em',
    padding: '12px 20px 8px',
  },
  nav: {
    flex: 1,
    padding: '4px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'all 0.18s',
    position: 'relative',
    fontWeight: 600,
    fontSize: 13,
  },
  navItemActive: {
    background: 'var(--red-faint)',
    color: 'var(--red)',
    borderLeft: '2px solid var(--red)',
    paddingLeft: 10,
  },
  navIconBox: {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    transition: 'all 0.18s',
    flexShrink: 0,
  },
  navIconActive: {
    background: 'var(--red)',
    color: '#fff',
    boxShadow: '0 0 10px var(--red-glow-sm)',
  },
  navLabel2: { flex: 1 },
  activeLine: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: 'var(--red)',
  },
  badge: {
    background: 'var(--red)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 800,
    padding: '1px 6px',
    borderRadius: 10,
    minWidth: 18,
    textAlign: 'center',
  },
  footer: { padding: '0 10px 18px' },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    width: '100%',
    padding: '10px 12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.18s',
    marginTop: 10,
  },
  version: {
    fontSize: 10,
    color: 'var(--text-faint)',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: '0.05em',
  },
};
