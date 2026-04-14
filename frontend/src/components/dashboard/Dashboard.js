import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarCheck,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { attendanceApi } from '../../api/attendance.api';
import { membersApi } from '../../api/members.api';
import { subscriptionsApi } from '../../api/subscriptions.api';
import { trainersApi } from '../../api/trainers.api';
import { getErrorMessage } from '../../utils/formatters';
import ErrorState from '../shared/ErrorState';
import Spinner from '../shared/Spinner';

const REVENUE_PLACEHOLDER = [
  { month: 'Oct', revenue: 4200, expenses: 1800 },
  { month: 'Nov', revenue: 4800, expenses: 1900 },
  { month: 'Dec', revenue: 5200, expenses: 2100 },
  { month: 'Jan', revenue: 6100, expenses: 2000 },
  { month: 'Feb', revenue: 5800, expenses: 2200 },
  { month: 'Mar', revenue: 6500, expenses: 2100 },
];

const AVATAR_COLORS = ['#e11d48', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildWeeklyAttendance(records, days = 7) {
  const buckets = [];
  const bucketMap = new Map();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = formatLocalDate(date);
    const bucket = {
      date: key,
      day: DAY_NAMES[date.getDay()],
      count: 0,
    };
    buckets.push(bucket);
    bucketMap.set(key, bucket);
  }

  records.forEach((record) => {
    const bucket = bucketMap.get(record.date);
    if (bucket) bucket.count += 1;
  });

  return buckets;
}

function buildSubscriptionStats(subscriptions, plans = []) {
  const availablePlans = plans.length
    ? plans
    : Array.from(
        subscriptions.reduce((acc, subscription) => {
          if (subscription.plan && !acc.has(subscription.plan.id)) {
            acc.set(subscription.plan.id, subscription.plan);
          }
          return acc;
        }, new Map()).values()
      );

  const activeSubs = subscriptions.filter((subscription) => subscription.status === 'active');

  return {
    monthlyRevenue: activeSubs.reduce(
      (sum, subscription) => sum + (subscription.plan?.price ?? subscription.amountPaid ?? 0),
      0
    ),
    byStatus: {
      active: subscriptions.filter((subscription) => subscription.status === 'active').length,
      expired: subscriptions.filter((subscription) => subscription.status === 'expired').length,
      pending: subscriptions.filter((subscription) => subscription.status === 'pending').length,
      cancelled: subscriptions.filter((subscription) => subscription.status === 'cancelled').length,
    },
    planDistribution: availablePlans.map((plan) => ({
      ...plan,
      activeCount: activeSubs.filter((subscription) => subscription.planId === plan.id).length,
      revenue: activeSubs
        .filter((subscription) => subscription.planId === plan.id)
        .reduce((sum, subscription) => sum + (subscription.plan?.price ?? subscription.amountPaid ?? plan.price ?? 0), 0),
    })),
  };
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1a1a1a',
        border: '1px solid #2e2e2e',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
      }}
    >
      <p
        style={{
          color: '#a1a1aa',
          fontWeight: 700,
          marginBottom: 5,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: 10,
        }}
      >
        {label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, fontWeight: 700 }}>
          {entry.name === 'revenue' || entry.name === 'expenses'
            ? `$${entry.value?.toLocaleString()}`
            : entry.value}
          <span style={{ fontWeight: 400, color: '#52525b' }}> {entry.name}</span>
        </p>
      ))}
    </div>
  );
};

function MetricRow({ label, value, max, color = 'var(--red)' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
          {value} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {max}</span>
        </span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 14px',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-soft)',
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, unreadCount } = useApp();
  const currentUser = state.currentUser;
  const role = currentUser?.role;
  const isAdmin = role === 'ADMIN';
  const isTrainer = role === 'TRAINER';
  const isMember = role === 'MEMBER';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError('');

    try {
      if (isAdmin) {
        const [membersRes, subsStats, attStats, attToday, trainersRes] = await Promise.all([
          membersApi.getAll({ limit: 100 }),
          subscriptionsApi.getStats(),
          attendanceApi.getStats(7),
          attendanceApi.getToday(),
          trainersApi.getAll({ limit: 100 }),
        ]);

        setData({
          members: membersRes.data,
          total: membersRes.meta?.total || membersRes.data.length,
          subsStats,
          attStats,
          todayCount: attToday.count || 0,
          recentCheckins: (attToday.records || []).slice(0, 5),
          trainers: trainersRes.data,
        });
      } else if (isTrainer) {
        const [membersRes, attStats, attToday, trainersRes] = await Promise.all([
          membersApi.getAll({ limit: 100 }),
          attendanceApi.getStats(7),
          attendanceApi.getToday(),
          trainersApi.getAll({ limit: 100 }),
        ]);

        const subscriptions = membersRes.data.flatMap((member) => member.subscriptions || []);

        setData({
          members: membersRes.data,
          total: membersRes.meta?.total || membersRes.data.length,
          subsStats: buildSubscriptionStats(subscriptions),
          attStats,
          todayCount: attToday.count || 0,
          recentCheckins: (attToday.records || []).slice(0, 5),
          trainers: trainersRes.data,
        });
      } else if (isMember) {
        const memberId = currentUser.member?.id;
        if (!memberId) {
          throw new Error('Your member profile is still loading. Please try again.');
        }

        const [member, historyRes] = await Promise.all([
          membersApi.getOne(memberId),
          attendanceApi.getMemberHistory(memberId, { limit: 30 }),
        ]);

        const subscriptions = (member.subscriptions || []).map((subscription) => ({
          ...subscription,
          memberName: member.name,
          memberAvatar: member.avatar,
        }));

        const history = (historyRes.data || []).map((record) => ({
          ...record,
          memberName: record.memberName || member.name,
          memberAvatar: record.memberAvatar || member.avatar,
        }));

        setData({
          members: [member],
          total: 1,
          subsStats: buildSubscriptionStats(subscriptions),
          attStats: { daily: buildWeeklyAttendance(history) },
          todayCount: history.filter((record) => record.date === formatLocalDate(new Date())).length,
          recentCheckins: history.slice(0, 5),
          trainers: member.trainer ? [member.trainer] : [],
        });
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAdmin, isMember, isTrainer]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />;
  if (!data) return null;

  const { members, total, subsStats, attStats, todayCount, recentCheckins, trainers } = data;

  const activeMembers = members.filter((member) => member.status === 'active').length;
  const activeSubs = subsStats.byStatus?.active || 0;
  const expiredSubs = subsStats.byStatus?.expired || 0;
  const pendingPayments = subsStats.byStatus?.pending || 0;
  const monthlyRevenue = subsStats.monthlyRevenue || 0;
  const activeTrainers = trainers.filter((trainer) => trainer.status === 'active').length;
  const planDist = (subsStats.planDistribution || []).filter((plan) => plan.activeCount > 0);

  const weeklyData = (attStats.daily || []).map((day) => ({ day: day.day, count: day.count }));
  const peakVal = weeklyData.length ? Math.max(...weeklyData.map((day) => day.count)) : 0;

  const statsCards = [
    {
      label: isMember ? 'Your Account' : 'Total Members',
      value: total,
      icon: Users,
      color: '#e11d48',
      bg: 'rgba(225,29,72,0.1)',
      change: '+12%',
      up: true,
      note: isMember ? `${activeMembers} active membership` : `${activeMembers} active`,
    },
    {
      label: 'Active Subscriptions',
      value: activeSubs,
      icon: CreditCard,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      change: '+8%',
      up: true,
      note: `${expiredSubs} expired`,
    },
    {
      label: isMember ? 'Current Spend' : 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.1)',
      change: '+18%',
      up: true,
      note: isMember ? 'active plan value' : 'vs last month',
    },
    {
      label: isMember ? "Today's Visits" : "Today's Check-ins",
      value: todayCount,
      icon: CalendarCheck,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
      change: '-5%',
      up: false,
      note: isMember ? 'your visits today' : 'check-ins today',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={S.banner}>
        <div>
          <div style={S.bannerEye}>
            <Zap size={12} color="var(--red)" /> PERFORMANCE OVERVIEW
          </div>
          <h2 style={S.bannerTitle}>Welcome back, let's crush it today</h2>
        </div>
        <div style={S.bannerStats}>
          <div style={S.bannerPill}>
            <span style={S.bannerPillLabel}>Capacity</span>
            <span style={S.bannerPillValue}>
              {total > 0 ? `${Math.round((todayCount / total) * 100)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid-4">
        {statsCards.map((card) => {
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

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        <div className="card">
          <div style={S.chartHeader}>
            <div>
              <div className="section-title" style={{ marginBottom: 2 }}>
                <DollarSign size={13} color="var(--red)" /> Revenue Overview
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly revenue vs expenses</p>
            </div>
            <div style={S.legendRow}>
              {[
                { label: 'Revenue', color: 'var(--red)' },
                { label: 'Expenses', color: '#374151' },
              ].map((legend) => (
                <span
                  key={legend.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 3,
                      background: legend.color,
                      borderRadius: 2,
                      display: 'inline-block',
                    }}
                  />
                  {legend.label}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={REVENUE_PLACEHOLDER} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#374151" stopOpacity={0.3} />
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

        <div className="card">
          <div className="section-title">
            <CalendarCheck size={13} color="var(--red)" /> Weekly Attendance
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="count" name="check-ins" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {weeklyData.map((entry, index) => (
                  <Cell key={entry.day || index} fill={entry.count === peakVal && peakVal > 0 ? '#e11d48' : '#1e1e1e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {peakVal > 0 && (
            <div style={S.peakNote}>
              <Zap size={11} color="var(--red)" />
              <span>
                Peak: <strong style={{ color: 'var(--text-primary)' }}>{weeklyData.find((day) => day.count === peakVal)?.day} ({peakVal} visits)</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="section-title">
            <CreditCard size={13} color="var(--red)" /> Plan Distribution
          </div>
          {planDist.length > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={planDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="activeCount"
                      strokeWidth={0}
                    >
                      {planDist.map((entry, index) => (
                        <Cell key={entry.id || index} fill={entry.color || AVATAR_COLORS[index % AVATAR_COLORS.length]} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} members`]}
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 6, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                {planDist.map((plan, index) => (
                  <div key={plan.id || plan.name || index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 3,
                        height: 28,
                        borderRadius: 2,
                        background: plan.color || AVATAR_COLORS[index % AVATAR_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{plan.name} Plan</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: plan.color || '#e11d48' }}>{plan.activeCount}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
              No active subscriptions
            </p>
          )}
        </div>

        <div className="card">
          <div className="section-title">
            <TrendingUp size={13} color="var(--red)" /> Gym Metrics
          </div>
          <MetricRow label="Member Capacity" value={total} max={Math.max(total, 1)} color="var(--red)" />
          <MetricRow
            label="Active Subscriptions"
            value={activeSubs}
            max={activeSubs + expiredSubs + pendingPayments || 1}
            color="#f59e0b"
          />
          <MetricRow
            label="Trainer Utilisation"
            value={activeTrainers}
            max={trainers.length || 1}
            color="#22c55e"
          />
          <MetricRow label="Today's Occupancy" value={todayCount} max={total || 1} color="#3b82f6" />
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: AlertCircle, label: 'Pending Payments', value: pendingPayments, color: '#f59e0b' },
              { icon: AlertCircle, label: 'Expired Subs', value: expiredSubs, color: '#ef4444' },
              { icon: Bell, label: 'Unread Alerts', value: unreadCount, color: '#3b82f6' },
            ].map(({ icon, label, value, color }) => (
              <QuickStat key={label} icon={icon} label={label} value={value} color={color} />
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>
              <CalendarCheck size={13} color="var(--red)" /> Recent Check-ins
            </div>
            <button
              onClick={() => navigate('/attendance')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--red)',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              View all <ArrowRight size={11} />
            </button>
          </div>
          {recentCheckins.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
              No check-ins today
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentCheckins.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="avatar"
                    style={{
                      width: 32,
                      height: 32,
                      fontSize: 11,
                      background: AVATAR_COLORS[index % AVATAR_COLORS.length],
                    }}
                  >
                    {item.memberAvatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.memberName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.date}</div>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--success)',
                      background: 'var(--success-faint)',
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}
                  >
                    {item.checkIn}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const S = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 22px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    borderLeft: '3px solid var(--red)',
    flexWrap: 'wrap',
    gap: 12,
  },
  bannerEye: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 9,
    fontWeight: 800,
    color: 'var(--red)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  bannerTitle: { fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' },
  bannerStats: { display: 'flex', gap: 10 },
  bannerPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 16px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--radius-sm)',
    minWidth: 72,
  },
  bannerPillLabel: {
    fontSize: 9,
    color: 'var(--text-muted)',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  bannerPillValue: { fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 },
  chartHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  legendRow: { display: 'flex', gap: 14, alignItems: 'center' },
  peakNote: { display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, fontSize: 11, color: 'var(--text-muted)' },
};
