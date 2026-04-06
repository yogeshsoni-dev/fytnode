import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, CalendarCheck, Clock, Users, TrendingUp } from 'lucide-react';
import Modal from '../shared/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ATTENDANCE_WEEKLY } from '../../data/mockData';

const AVATAR_BG = ['#e11d48', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#06b6d4'];

export default function Attendance() {
  const { state, dispatch } = useApp();
  const { attendance, members } = state;

  const [search, setSearch]   = useState('');
  const [date, setDate]       = useState('');
  const [showModal, setModal] = useState(false);
  const [tab, setTab]         = useState('records');
  const [formError, setFErr]  = useState('');
  const [form, setForm]       = useState({
    memberId: '', checkIn: '', checkOut: '',
    date: new Date().toISOString().split('T')[0],
  });

  const filtered = useMemo(() => {
    return attendance.filter(a => {
      const m = members.find(mb => mb.id === a.memberId);
      return (
        (!search || m?.name.toLowerCase().includes(search.toLowerCase())) &&
        (!date   || a.date === date)
      );
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendance, members, search, date]);

  const todayCount  = attendance.filter(a => a.date === '2024-03-25').length;
  const uniqueCount = new Set(attendance.map(a => a.memberId)).size;
  const avgMins     = (() => {
    const durations = attendance.filter(a => a.checkOut).map(a => {
      const [ih, im] = a.checkIn.split(':').map(Number);
      const [oh, om] = a.checkOut.split(':').map(Number);
      return (oh * 60 + om) - (ih * 60 + im);
    });
    return durations.length ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;
  })();

  const handleCheckIn = (e) => {
    e.preventDefault();
    if (!form.memberId) { setFErr('Please select a member'); return; }
    if (!form.checkIn)  { setFErr('Check-in time is required'); return; }
    setFErr('');
    dispatch({
      type: 'CHECK_IN',
      payload: {
        id: Date.now(),
        memberId: parseInt(form.memberId),
        date: form.date,
        checkIn: form.checkIn,
        checkOut: form.checkOut || null,
      },
    });
    setForm({ memberId: '', checkIn: '', checkOut: '', date: new Date().toISOString().split('T')[0] });
    setModal(false);
  };

  const peakVal = Math.max(...ATTENDANCE_WEEKLY.map(d => d.count));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="page-subtitle">{attendance.length} total records across all members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={15} /> Record Check-in
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Today's Check-ins", value: todayCount,  icon: CalendarCheck, color: '#e11d48', bg: 'rgba(225,29,72,0.1)' },
          { label: 'Total Records',     value: attendance.length, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Unique Members',    value: uniqueCount, icon: Users,         color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Avg Duration',      value: `${avgMins}m`, icon: Clock,       color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="stat-card" style={{ '--accent-color': c.color }}>
              <div className="stat-icon" style={{ background: c.bg }}><Icon size={18} color={c.color} /></div>
              <div className="stat-info">
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'records' ? 'active' : ''}`} onClick={() => setTab('records')}>Records</button>
        <button className={`tab-btn ${tab === 'report'  ? 'active' : ''}`} onClick={() => setTab('report')}>Weekly Report</button>
      </div>

      {tab === 'records' ? (
        <>
          <div className="filter-bar">
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <Search size={14} className="search-icon" />
              <input className="form-input search-input" placeholder="Search member…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <input type="date" className="form-input" style={{ width: 'auto' }} value={date} onChange={e => setDate(e.target.value)} />
            {date && <button className="btn btn-secondary btn-sm" onClick={() => setDate('')}>Clear</button>}
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
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><Search size={28} /><h3>No records</h3></div></td></tr>
                ) : filtered.map((rec, idx) => {
                  const m = members.find(mb => mb.id === rec.memberId);
                  let dur = '—';
                  if (rec.checkOut) {
                    const [ih, im] = rec.checkIn.split(':').map(Number);
                    const [oh, om] = rec.checkOut.split(':').map(Number);
                    const mins = (oh * 60 + om) - (ih * 60 + im);
                    dur = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                  }
                  return (
                    <tr key={rec.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: 10, background: AVATAR_BG[idx % AVATAR_BG.length] }}>{m?.avatar}</div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{m?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{rec.date}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                          <Clock size={12} color="var(--success)" /> {rec.checkIn}
                        </div>
                      </td>
                      <td>
                        {rec.checkOut
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}><Clock size={12} color="var(--danger)" /> {rec.checkOut}</div>
                          : <span className="badge badge-active">Active</span>}
                      </td>
                      <td style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{dur}</td>
                      <td><span className={`badge badge-${rec.checkOut ? 'inactive' : 'active'}`}>{rec.checkOut ? 'Done' : 'In Progress'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="section-title"><TrendingUp size={13} color="var(--red)" /> Weekly Attendance Report</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ATTENDANCE_WEEKLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#52525b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa', fontWeight: 700 }}
                itemStyle={{ color: '#e11d48' }}
              />
              <Bar dataKey="count" name="Check-ins" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {ATTENDANCE_WEEKLY.map((entry, i) => (
                  <Cell key={i} fill={entry.count === peakVal ? '#e11d48' : '#1e1e1e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 24 }}>
            {[
              { label: 'Peak Day',     value: `Sat (${peakVal})` },
              { label: 'Slowest Day',  value: `Sun (${Math.min(...ATTENDANCE_WEEKLY.map(d => d.count))})` },
              { label: 'Weekly Total', value: ATTENDANCE_WEEKLY.reduce((s, d) => s + d.count, 0) },
              { label: 'Daily Avg',    value: Math.round(ATTENDANCE_WEEKLY.reduce((s, d) => s + d.count, 0) / 7) },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--red)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-in modal */}
      <Modal isOpen={showModal} onClose={() => setModal(false)} title="Record Check-in">
        <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {formError && (
            <div style={{ padding: '10px 14px', background: 'var(--danger-faint)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13 }}>
              {formError}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Member *</label>
            <select className="form-input" value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))}>
              <option value="">Select member…</option>
              {members.filter(m => m.status === 'active').map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Check-in Time *</label>
              <input type="time" className="form-input" value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Check-out Time</label>
              <input type="time" className="form-input" value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary"><CalendarCheck size={14} /> Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
