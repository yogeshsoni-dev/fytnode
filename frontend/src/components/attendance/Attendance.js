import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarCheck,
  Clock,
  Plus,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { attendanceApi } from '../../api/attendance.api';
import { membersApi } from '../../api/members.api';
import { calcDuration, getErrorMessage } from '../../utils/formatters';
import ErrorState from '../shared/ErrorState';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

const AVATAR_BG = ['#e11d48', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#06b6d4'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildLocalStats(records, days = 7) {
  const buckets = [];
  const counts = new Map();

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
    counts.set(key, bucket);
  }

  records.forEach((record) => {
    const bucket = counts.get(record.date);
    if (bucket) bucket.count += 1;
  });

  return {
    todayCount: counts.get(formatLocalDate(new Date()))?.count || 0,
    daily: buckets,
  };
}

export default function Attendance() {
  const { state } = useApp();
  const role = state.currentUser?.role;
  const isAdmin = role === 'ADMIN';
  const isTrainer = role === 'TRAINER';
  const isMember = role === 'MEMBER';
  const canSelectMember = isAdmin || isTrainer;
  const memberId = state.currentUser?.member?.id;

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('records');

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ memberId: '' });

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (dateFilter) {
        params.from = dateFilter;
        params.to = dateFilter;
      }

      if (isMember) {
        if (!memberId) {
          throw new Error('Your member profile is still loading. Please try again.');
        }

        const historyRes = await attendanceApi.getMemberHistory(memberId, {
          ...params,
          limit: 100,
        });

        setRecords(historyRes.data);
        setStats(buildLocalStats(historyRes.data));
      } else {
        const [recordsRes, statsRes] = await Promise.all([
          attendanceApi.getAll({ ...params, limit: 100 }),
          attendanceApi.getStats(7),
        ]);

        setRecords(recordsRes.data);
        setStats(statsRes);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [dateFilter, isMember, memberId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    if (!canSelectMember) return;

    membersApi
      .getAll({ status: 'ACTIVE', limit: 100 })
      .then((res) => setMembers(res.data))
      .catch(() => {});
  }, [canSelectMember]);

  const filtered = useMemo(() => {
    if (!search) return records;
    return records.filter((record) =>
      record.memberName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [records, search]);

  const totalRecords = records.length;
  const uniqueMembers = isMember
    ? (records.length > 0 ? 1 : 0)
    : new Set(records.map((record) => record.memberId)).size;
  const avgMins = (() => {
    const durations = records
      .filter((record) => record.checkIn && record.checkOut)
      .map((record) => {
        const [inHour, inMinute] = record.checkIn.split(':').map(Number);
        const [outHour, outMinute] = record.checkOut.split(':').map(Number);
        return (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
      })
      .filter((minutes) => minutes > 0);

    if (!durations.length) return 0;
    return Math.round(durations.reduce((sum, minutes) => sum + minutes, 0) / durations.length);
  })();

  const todayCount = stats?.todayCount || 0;
  const weeklyData = stats?.daily || [];
  const peakVal = weeklyData.length ? Math.max(...weeklyData.map((day) => day.count)) : 0;
  const showActionColumn = true;
  const emptyColSpan = showActionColumn ? 7 : 6;

  const handleCheckIn = async (event) => {
    event.preventDefault();
    if (canSelectMember && !form.memberId) {
      setFormError('Please select a member.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const selectedMemberId = canSelectMember ? parseInt(form.memberId, 10) : null;
      await attendanceApi.checkIn(selectedMemberId);
      setShowModal(false);
      setForm({ memberId: '' });
      await loadRecords();
    } catch (saveError) {
      setFormError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const handleCheckOut = async (record) => {
    try {
      await attendanceApi.checkOut(record.id);
      await loadRecords();
    } catch (saveError) {
      alert(getErrorMessage(saveError));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="page-subtitle">
            {isMember
              ? `${totalRecords} records in your attendance history`
              : `${totalRecords} total records across all members`}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowModal(true);
            setFormError('');
          }}
        >
          <Plus size={15} /> {isMember ? 'Check In' : 'Record Check-in'}
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          {
            label: isMember ? "Today's Visits" : "Today's Check-ins",
            value: todayCount,
            icon: CalendarCheck,
            color: '#e11d48',
            bg: 'rgba(225,29,72,0.1)',
          },
          {
            label: 'Total Records',
            value: totalRecords,
            icon: TrendingUp,
            color: '#22c55e',
            bg: 'rgba(34,197,94,0.1)',
          },
          {
            label: isMember ? 'Account Scope' : 'Unique Members',
            value: isMember ? '1' : uniqueMembers,
            icon: Users,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)',
          },
          {
            label: 'Avg Duration',
            value: `${avgMins}m`,
            icon: Clock,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.1)',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card" style={{ '--accent-color': card.color }}>
              <div className="stat-icon" style={{ background: card.bg }}>
                <Icon size={18} color={card.color} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${tab === 'records' ? 'active' : ''}`}
          onClick={() => setTab('records')}
        >
          Records
        </button>
        <button
          className={`tab-btn ${tab === 'report' ? 'active' : ''}`}
          onClick={() => setTab('report')}
        >
          Weekly Report
        </button>
      </div>

      {tab === 'records' ? (
        loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState message={error} onRetry={loadRecords} />
        ) : (
          <>
            <div className="filter-bar">
              <div className="search-input-wrapper" style={{ flex: 1 }}>
                <Search size={14} className="search-icon" />
                <input
                  className="form-input search-input"
                  placeholder="Search member..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <input
                type="date"
                className="form-input"
                style={{ width: 'auto' }}
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              />
              {dateFilter && (
                <button className="btn btn-secondary btn-sm" onClick={() => setDateFilter('')}>
                  Clear
                </button>
              )}
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                    {showActionColumn && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={emptyColSpan}>
                        <div className="empty-state">
                          <Search size={28} />
                          <h3>No records</h3>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((record, index) => (
                      <tr key={record.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div
                              className="avatar"
                              style={{
                                width: 30,
                                height: 30,
                                fontSize: 10,
                                background: AVATAR_BG[index % AVATAR_BG.length],
                              }}
                            >
                              {record.memberAvatar || state.currentUser?.name?.slice(0, 1) || '?'}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13 }}>
                              {record.memberName || state.currentUser?.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{record.date}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                            <Clock size={12} color="var(--success)" /> {record.checkIn}
                          </div>
                        </td>
                        <td>
                          {record.checkOut ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                              <Clock size={12} color="var(--danger)" /> {record.checkOut}
                            </div>
                          ) : (
                            <span className="badge badge-active">Active</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {calcDuration(record.checkIn, record.checkOut)}
                        </td>
                        <td>
                          <span className={`badge badge-${record.checkOut ? 'inactive' : 'active'}`}>
                            {record.checkOut ? 'Done' : 'In Progress'}
                          </span>
                        </td>
                        {showActionColumn && (
                          <td>
                            {!record.checkOut && (
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleCheckOut(record)}
                              >
                                Check Out
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        <div className="card">
          <div className="section-title">
            <TrendingUp size={13} color="var(--red)" /> Weekly Attendance Report
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#52525b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#1a1a1a',
                  border: '1px solid #2e2e2e',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#a1a1aa', fontWeight: 700 }}
                itemStyle={{ color: '#e11d48' }}
              />
              <Bar dataKey="count" name="Check-ins" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={entry.date || index}
                    fill={entry.count === peakVal && peakVal > 0 ? '#e11d48' : '#1e1e1e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {weeklyData.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: 12,
                marginTop: 24,
              }}
            >
              {[
                {
                  label: 'Peak Day',
                  value: `${weeklyData.find((day) => day.count === peakVal)?.day || '-'} (${peakVal})`,
                },
                {
                  label: 'Slowest Day',
                  value: (() => {
                    const min = Math.min(...weeklyData.map((day) => day.count));
                    return `${weeklyData.find((day) => day.count === min)?.day || '-'} (${min})`;
                  })(),
                },
                {
                  label: 'Weekly Total',
                  value: weeklyData.reduce((sum, day) => sum + day.count, 0),
                },
                {
                  label: 'Daily Avg',
                  value: Math.round(
                    weeklyData.reduce((sum, day) => sum + day.count, 0) / (weeklyData.length || 1)
                  ),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    textAlign: 'center',
                    padding: '14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 6,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--red)' }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Check-in">
        <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {formError && (
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
              {formError}
            </div>
          )}

          {canSelectMember && (
            <div className="form-group">
              <label className="form-label">Member *</label>
              <select
                className="form-input"
                value={form.memberId}
                onChange={(event) => setForm((prev) => ({ ...prev, memberId: event.target.value }))}
              >
                <option value="">Select member...</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isMember && (
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                padding: '12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              This will record your check-in at the current time.
            </p>
          )}

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
              {saving ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.25)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.65s linear infinite',
                  }}
                />
              ) : (
                <>
                  <CalendarCheck size={14} /> Check In
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
