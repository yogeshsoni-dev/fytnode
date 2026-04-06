import { useApp } from '../../context/AppContext';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Users, CreditCard, DollarSign, CalendarCheck,
  TrendingUp, TrendingDown, AlertCircle, ArrowRight, Zap, Bell
} from 'lucide-react';
import { REVENUE_DATA, ATTENDANCE_WEEKLY } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

/* ─── Custom chart tooltip ─────────────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #2e2e2e',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: '#a1a1aa', fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>
          {p.name === 'revenue' || p.name === 'expenses'
            ? `$${p.value.toLocaleString()}`
            : p.value} <span style={{ fontWeight: 400, color: '#52525b' }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── Progress metric row ───────────────────────────────────────────────── */
function MetricRow({ label, value, max, color = 'var(--red)' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{value} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {max}</span></span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ─── Quick stat pill ───────────────────────────────────────────────────── */
function QuickStat({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '13px 14px',
      background: 'var(--bg-elevated)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-soft)',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{value}</div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { state } = useApp();
  const { members, subscriptions, attendance, trainers, notifications, subscriptionPlans } = state;
  const navigate = useNavigate();

  /* Aggregates */
  const activeMembers       = members.filter(m => m.status === 'active').length;
  const activeSubs          = subscriptions.filter(s => s.status === 'active').length;
  const monthlyRevenue      = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => {
    const plan = subscriptionPlans.find(p => p.id === s.planId);
    return sum + (plan?.price || 0);
  }, 0);
  const todayCheckins       = attendance.filter(a => a.date === '2024-03-25').length;
  const unreadNotifs        = notifications.filter(n => !n.read).length;
  const activeTrainers      = trainers.filter(t => t.status === 'active').length;
  const expiredSubs         = subscriptions.filter(s => s.status === 'expired').length;
  const pendingPayments     = subscriptions.filter(s => s.status === 'pending').length;

  /* Plan distribution for donut */
  const planDist = subscriptionPlans.map(plan => ({
    name: plan.name,
    value: subscriptions.filter(s => s.planId === plan.id && s.status === 'active').length,
    color: plan.color,
  })).filter(p => p.value > 0);

  /* Recent check-ins */
  const recentCheckins = attendance.slice().reverse().slice(0, 5).map(a => ({
    ...a,
    member: members.find(m => m.id === a.memberId),
  }));

  /* Stat cards */
  const STATS = [
    { label: 'Total Members',       value: members.length, icon: Users,
      color: '#e11d48', bg: 'rgba(225,29,72,0.1)',
      change: '+12%', up: true, note: `${activeMembers} active` },
    { label: 'Active Subscriptions', value: activeSubs, icon: CreditCard,
      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
      change: '+8%', up: true, note: `${expiredSubs} expired` },
    { label: 'Monthly Revenue',     value: `$${monthlyRevenue.toLocaleString()}`, icon: DollarSign,
      color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
      change: '+18%', up: true, note: 'vs last month' },
    { label: "Today's Check-ins",   value: todayCheckins, icon: CalendarCheck,
      color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
      change: '-5%', up: false, note: 'check-ins today' },
  ];

  const AVATAR_COLORS = ['#e11d48', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Welcome banner ── */}
      <div style={S.banner}>
        <div>
          <div style={S.bannerEye}><Zap size={12} color="var(--red)" /> PERFORMANCE OVERVIEW</div>
          <h2 style={S.bannerTitle}>Welcome back, let's crush it today</h2>
        </div>
        <div style={S.bannerStats}>
          {[
            { label: 'Week', value: 'W12 / 2024' },
            { label: 'Capacity', value: `${Math.round((todayCheckins / members.length) * 100)}%` },
          ].map(({ label, value }) => (
            <div key={label} style={S.bannerPill}>
              <span style={S.bannerPillLabel}>{label}</span>
              <span style={S.bannerPillValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid-4">
        {STATS.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card" style={{ '--accent-color': card.color }}>
              <div className="stat-icon" style={{ background: card.bg }}>
                <Icon size={20} color={card.color} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
                <div className={`stat-change ${card.up ? 'up' : 'down'}`}>
                  {card.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {card.change}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{card.note}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        {/* Revenue chart */}
        <div className="card">
          <div style={S.chartHeader}>
            <div>
              <div className="section-title" style={{ marginBottom: 2 }}>
                <DollarSign size={13} color="var(--red)" /> Revenue Overview
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly revenue vs expenses</p>
            </div>
            <div style={S.legendRow}>
              {[{ label: 'Revenue', color: 'var(--red)' }, { label: 'Expenses', color: '#374151' }].map(l => (
                <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span style={{ width: 24, height: 3, background: l.color, borderRadius: 2, display: 'inline-block' }} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#374151" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#374151" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e1e" />
              <XAxis dataKey="month" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2.5} fill="url(#redGrad)" dot={false} />
              <Area type="monotone" dataKey="expenses" stroke="#374151" strokeWidth={1.5} fill="url(#grayGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance chart */}
        <div className="card">
          <div className="section-title">
            <CalendarCheck size={13} color="var(--red)" /> Weekly Attendance
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={ATTENDANCE_WEEKLY} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="count" name="check-ins" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {ATTENDANCE_WEEKLY.map((entry, i) => (
                  <Cell key={i} fill={entry.count === Math.max(...ATTENDANCE_WEEKLY.map(d => d.count)) ? '#e11d48' : '#1e1e1e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={S.peakNote}>
            <Zap size={11} color="var(--red)" />
            <span>Peak day: <strong style={{ color: '#fff' }}>Saturday (71 visits)</strong></span>
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

        {/* Plan distribution */}
        <div className="card">
          <div className="section-title"><CreditCard size={13} color="var(--red)" /> Plan Distribution</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={planDist} cx="50%" cy="50%"
                  innerRadius={48} outerRadius={70}
                  paddingAngle={4} dataKey="value"
                  strokeWidth={0}
                >
                  {planDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} members`]} contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 6, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {planDist.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 28, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{p.name} Plan</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: p.color }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity & metrics */}
        <div className="card">
          <div className="section-title"><TrendingUp size={13} color="var(--red)" /> Gym Metrics</div>
          <MetricRow label="Member Capacity"     value={members.length}  max={100} color="var(--red)" />
          <MetricRow label="Active Subscriptions" value={activeSubs}       max={subscriptions.length} color="#f59e0b" />
          <MetricRow label="Trainer Utilisation"  value={activeTrainers}   max={trainers.length}      color="#22c55e" />
          <MetricRow label="Today's Occupancy"    value={todayCheckins}    max={members.length}        color="#3b82f6" />

          <div style={{ marginTop: 16 }}>
            {[
              { icon: AlertCircle, label: 'Pending Payments', value: pendingPayments, color: '#f59e0b' },
              { icon: AlertCircle, label: 'Expired Subs',     value: expiredSubs,     color: '#ef4444' },
              { icon: Bell,       label: 'Unread Alerts',    value: unreadNotifs,    color: '#3b82f6' },
            ].map(({ icon, label, value, color }) => (
              <QuickStat key={label} icon={icon} label={label} value={value} color={color} />
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>
              <CalendarCheck size={13} color="var(--red)" /> Recent Check-ins
            </div>
            <button
              onClick={() => navigate('/attendance')}
              style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              View all <ArrowRight size={11} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentCheckins.map((item, i) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 11, background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {item.member?.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.member?.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.date}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--success)', background: 'var(--success-faint)', padding: '3px 8px', borderRadius: 4 }}>
                  {item.checkIn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  banner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 22px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    borderLeft: '3px solid var(--red)',
    flexWrap: 'wrap', gap: 12,
  },
  bannerEye: {
    display: 'flex', alignItems: 'center', gap: 5,
    fontSize: 9, fontWeight: 800, color: 'var(--red)',
    letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5,
  },
  bannerTitle: {
    fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-0.2px',
  },
  bannerStats: { display: 'flex', gap: 10 },
  bannerPill: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '8px 16px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-sm)',
    minWidth: 72,
  },
  bannerPillLabel: { fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' },
  bannerPillValue: { fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 2 },
  chartHeader: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 16, flexWrap: 'wrap', gap: 8,
  },
  legendRow: { display: 'flex', gap: 14, alignItems: 'center' },
  peakNote: {
    display: 'flex', alignItems: 'center', gap: 5,
    marginTop: 10, fontSize: 11, color: 'var(--text-muted)',
  },
};
