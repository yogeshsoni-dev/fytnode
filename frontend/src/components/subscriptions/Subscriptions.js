import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Edit2, CheckCircle, XCircle, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import Modal from '../shared/Modal';

const STATUS_FILTERS = ['all', 'active', 'expired', 'pending'];

export default function Subscriptions() {
  const { state, dispatch } = useApp();
  const { subscriptions, members, subscriptionPlans } = state;

  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [showModal, setModal]   = useState(false);
  const [editSub, setEdit]      = useState(null);
  const [tab, setTab]           = useState('subscriptions');
  const [form, setForm]         = useState({ memberId: '', planId: '', startDate: '', status: 'active' });

  const filtered = useMemo(() => subscriptions.filter(s => {
    const m = members.find(mb => mb.id === s.memberId);
    return (
      (!search || m?.name.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === 'all' || s.status === statusFilter)
    );
  }), [subscriptions, members, search, statusFilter]);

  const monthlyRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => { const p = subscriptionPlans.find(p => p.id === s.planId); return sum + (p?.price || 0); }, 0);

  const openAdd = () => {
    setForm({ memberId: '', planId: '', startDate: new Date().toISOString().split('T')[0], status: 'active' });
    setEdit(null);
    setModal(true);
  };

  const openEdit = (sub) => {
    setEdit(sub);
    setForm({ memberId: sub.memberId, planId: sub.planId, startDate: sub.startDate, status: sub.status });
    setModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const plan = subscriptionPlans.find(p => p.id === parseInt(form.planId));
    if (!plan) return;
    const end = new Date(form.startDate);
    end.setMonth(end.getMonth() + plan.duration);
    const payload = {
      ...form,
      memberId: parseInt(form.memberId),
      planId:   parseInt(form.planId),
      endDate:  end.toISOString().split('T')[0],
      amountPaid: form.status === 'active' ? plan.price : 0,
    };
    if (editSub) {
      dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: { ...editSub, ...payload } });
    } else {
      dispatch({ type: 'ADD_SUBSCRIPTION', payload: { ...payload, id: Date.now() } });
    }
    setModal(false);
  };

  const counts = {
    active:  subscriptions.filter(s => s.status === 'active').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    pending: subscriptions.filter(s => s.status === 'pending').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Subscriptions & Payments</h2>
          <p className="page-subtitle">{subscriptions.length} subscriptions · ${monthlyRevenue.toLocaleString()} monthly revenue</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> New Subscription</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Active',          value: counts.active,  icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Expired',         value: counts.expired, icon: XCircle,     color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          { label: 'Pending Payment', value: counts.pending, icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Monthly Revenue', value: `$${monthlyRevenue}`, icon: DollarSign, color: '#e11d48', bg: 'rgba(225,29,72,0.1)' },
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
        <button className={`tab-btn ${tab === 'subscriptions' ? 'active' : ''}`} onClick={() => setTab('subscriptions')}>Subscriptions</button>
        <button className={`tab-btn ${tab === 'plans'         ? 'active' : ''}`} onClick={() => setTab('plans')}>Plans</button>
      </div>

      {tab === 'plans' ? (
        /* ── Plan cards ── */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {subscriptionPlans.map(plan => {
            const activePlanMembers = subscriptions.filter(s => s.planId === plan.id && s.status === 'active').length;
            const planRevenue       = activePlanMembers * plan.price;
            return (
              <div key={plan.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${plan.color}`,
                borderRadius: 'var(--radius)',
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative circle */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${plan.color}08` }} />

                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: plan.color, letterSpacing: '0.12em', marginBottom: 6 }}>{plan.name.toUpperCase()} PLAN</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>${plan.price}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/{plan.duration === 1 ? 'month' : `${plan.duration} months`}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <CheckCircle size={13} color={plan.color} />
                      <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Members</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: plan.color }}>{activePlanMembers}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Monthly Revenue</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>${planRevenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Subscriptions table ── */
        <>
          <div className="filter-bar">
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <Search size={14} className="search-icon" />
              <input className="form-input search-input" placeholder="Search member…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUS_FILTERS.map(f => (
                <button key={f} onClick={() => setStatus(f)} style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'all 0.18s',
                  borderColor: statusFilter === f ? 'var(--red)'       : 'var(--border-soft)',
                  background:  statusFilter === f ? 'var(--red-faint)' : 'var(--bg-elevated)',
                  color:       statusFilter === f ? 'var(--red)'       : 'var(--text-muted)',
                }}>{f}</button>
              ))}
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><CreditCard size={28} /><h3>No subscriptions found</h3></div></td></tr>
                ) : filtered.map(sub => {
                  const member = members.find(m => m.id === sub.memberId);
                  const plan   = subscriptionPlans.find(p => p.id === sub.planId);
                  return (
                    <tr key={sub.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: 10, background: 'linear-gradient(135deg,#e11d48,#9f1239)' }}>
                            {member?.avatar}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{member?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>
                        {plan && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 4, background: `${plan.color}18`, color: plan.color }}>{plan.name}</span>}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub.startDate}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub.endDate}</td>
                      <td>
                        <span style={{ fontSize: 13, fontWeight: 800, color: sub.amountPaid > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                          ${sub.amountPaid}
                        </span>
                      </td>
                      <td><span className={`badge badge-${sub.status}`}>{sub.status}</span></td>
                      <td>
                        <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEdit(sub)}>
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setModal(false)} title={editSub ? 'Edit Subscription' : 'New Subscription'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Member *</label>
            <select className="form-input" value={form.memberId} onChange={e => setForm(f => ({ ...f, memberId: e.target.value }))} required>
              <option value="">Select member…</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Plan *</label>
            <select className="form-input" value={form.planId} onChange={e => setForm(f => ({ ...f, planId: e.target.value }))} required>
              <option value="">Select plan…</option>
              {subscriptionPlans.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price} / {p.duration}mo</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editSub ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
