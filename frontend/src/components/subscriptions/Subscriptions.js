import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  DollarSign,
  Edit2,
  Plus,
  Search,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { membersApi } from '../../api/members.api';
import { subscriptionsApi } from '../../api/subscriptions.api';
import { getErrorMessage } from '../../utils/formatters';
import ErrorState from '../shared/ErrorState';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

const STATUS_FILTERS = ['all', 'active', 'expired', 'pending', 'cancelled'];

function buildSubscriptionStats(subscriptions, plans) {
  const activeSubs = subscriptions.filter((sub) => sub.status === 'active');
  const byStatus = {
    active: subscriptions.filter((sub) => sub.status === 'active').length,
    expired: subscriptions.filter((sub) => sub.status === 'expired').length,
    pending: subscriptions.filter((sub) => sub.status === 'pending').length,
    cancelled: subscriptions.filter((sub) => sub.status === 'cancelled').length,
  };

  const monthlyRevenue = activeSubs.reduce(
    (sum, sub) => sum + (sub.plan?.price ?? sub.amountPaid ?? 0),
    0
  );

  const planDistribution = plans.map((plan) => ({
    ...plan,
    activeCount: activeSubs.filter((sub) => sub.planId === plan.id).length,
    revenue: activeSubs
      .filter((sub) => sub.planId === plan.id)
      .reduce((sum, sub) => sum + (sub.plan?.price ?? sub.amountPaid ?? plan.price ?? 0), 0),
  }));

  return { monthlyRevenue, byStatus, planDistribution };
}

export default function Subscriptions() {
  const { state } = useApp();
  const role = state.currentUser?.role;
  const isAdmin = role === 'ADMIN';
  const isTrainer = role === 'TRAINER';
  const isMember = role === 'MEMBER';
  const canManage = isAdmin;

  const [subscriptions, setSubscriptions] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editSub, setEditSub] = useState(null);
  const [tab, setTab] = useState('subscriptions');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    memberId: '',
    planId: '',
    startDate: '',
    status: 'active',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const plansRes = await subscriptionsApi.getPlans();
      setPlans(plansRes);

      if (isAdmin) {
        const [subscriptionsRes, membersRes, statsRes] = await Promise.all([
          subscriptionsApi.getAll({ limit: 100 }),
          membersApi.getAll({ limit: 100 }),
          subscriptionsApi.getStats(),
        ]);

        setSubscriptions(subscriptionsRes.data);
        setMembers(membersRes.data);
        setStats(statsRes);
      } else if (isTrainer) {
        const [subscriptionsRes, membersRes] = await Promise.all([
          subscriptionsApi.getAll({ limit: 100 }),
          membersApi.getAll({ limit: 100 }),
        ]);

        setSubscriptions(subscriptionsRes.data);
        setMembers(membersRes.data);
        setStats(buildSubscriptionStats(subscriptionsRes.data, plansRes));
      } else if (isMember) {
        const currentMemberId = state.currentUser?.member?.id;
        if (!currentMemberId) {
          throw new Error('Your member profile is still loading. Please try again.');
        }

        const member = await membersApi.getOne(currentMemberId);
        const ownSubscriptions = (member.subscriptions || []).map((subscription) => ({
          ...subscription,
          memberId: member.id,
          memberName: member.name,
          memberAvatar: member.avatar,
        }));

        setMembers([member]);
        setSubscriptions(ownSubscriptions);
        setStats(buildSubscriptionStats(ownSubscriptions, plansRes));
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isMember, isTrainer, state.currentUser?.member?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return subscriptions.filter((subscription) => {
      const matchesSearch =
        !search ||
        subscription.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        subscription.plan?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, subscriptions]);

  const monthlyRevenue = stats?.monthlyRevenue || 0;
  const counts = {
    active: stats?.byStatus?.active || 0,
    expired: stats?.byStatus?.expired || 0,
    pending: stats?.byStatus?.pending || 0,
    cancelled: stats?.byStatus?.cancelled || 0,
  };

  const openAdd = () => {
    setForm({
      memberId: '',
      planId: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setEditSub(null);
    setSaveError('');
    setShowModal(true);
  };

  const openEdit = (subscription) => {
    setEditSub(subscription);
    setForm({
      memberId: String(subscription.memberId),
      planId: String(subscription.planId),
      startDate: subscription.startDate,
      status: subscription.status,
    });
    setSaveError('');
    setShowModal(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const plan = plans.find((item) => item.id === parseInt(form.planId, 10));
    if (!plan) {
      setSaveError('Please select a valid plan.');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const payload = {
        memberId: parseInt(form.memberId, 10),
        planId: parseInt(form.planId, 10),
        startDate: form.startDate,
        status: form.status,
        amountPaid: form.status === 'active' ? plan.price : 0,
      };

      if (editSub) {
        await subscriptionsApi.update(editSub.id, payload);
      } else {
        await subscriptionsApi.create(payload);
      }

      setShowModal(false);
      await loadData();
    } catch (saveActionError) {
      setSaveError(getErrorMessage(saveActionError));
    } finally {
      setSaving(false);
    }
  };

  const subtitle = isMember
    ? `${subscriptions.length} subscription records`
    : `${subscriptions.length} subscriptions | $${monthlyRevenue.toLocaleString()} monthly revenue`;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Subscriptions & Payments</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> New Subscription
          </button>
        )}
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Active', value: counts.active, icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Expired', value: counts.expired, icon: XCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
          {
            label: 'Pending Payment',
            value: counts.pending,
            icon: AlertCircle,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)',
          },
          {
            label: isMember ? 'Current Spend' : 'Monthly Revenue',
            value: `$${monthlyRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: '#e11d48',
            bg: 'rgba(225,29,72,0.1)',
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
          className={`tab-btn ${tab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setTab('subscriptions')}
        >
          Subscriptions
        </button>
        <button
          className={`tab-btn ${tab === 'plans' ? 'active' : ''}`}
          onClick={() => setTab('plans')}
        >
          Plans
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : tab === 'plans' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {plans.map((plan) => {
            const activePlanMembers = stats?.planDistribution?.find((item) => item.id === plan.id)?.activeCount || 0;
            const planRevenue = stats?.planDistribution?.find((item) => item.id === plan.id)?.revenue || 0;

            return (
              <div
                key={plan.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderTop: `3px solid ${plan.color || '#e11d48'}`,
                  borderRadius: 'var(--radius)',
                  padding: 24,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `${plan.color || '#e11d48'}08`,
                  }}
                />

                <div style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: plan.color || '#e11d48',
                      letterSpacing: '0.12em',
                      marginBottom: 6,
                    }}
                  >
                    {plan.name.toUpperCase()} PLAN
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>
                      ${plan.price}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      /{plan.duration === 1 ? 'month' : `${plan.duration} months`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {(plan.features || []).map((feature) => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <CheckCircle size={13} color={plan.color || '#e11d48'} />
                      <span style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Active Members
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: plan.color || '#e11d48' }}>
                      {activePlanMembers}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Monthly Revenue
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>
                      ${planRevenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="filter-bar">
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <Search size={14} className="search-icon" />
              <input
                className="form-input search-input"
                placeholder="Search member or plan..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.18s',
                    borderColor: statusFilter === filter ? 'var(--red)' : 'var(--border-soft)',
                    background: statusFilter === filter ? 'var(--red-faint)' : 'var(--bg-elevated)',
                    color: statusFilter === filter ? 'var(--red)' : 'var(--text-muted)',
                  }}
                >
                  {filter}
                </button>
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
                  {canManage && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 7 : 6}>
                      <div className="empty-state">
                        <CreditCard size={28} />
                        <h3>No subscriptions found</h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((subscription) => (
                    <tr key={subscription.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div
                            className="avatar"
                            style={{
                              width: 30,
                              height: 30,
                              fontSize: 10,
                              background: 'linear-gradient(135deg,#e11d48,#9f1239)',
                            }}
                          >
                            {subscription.memberAvatar || '??'}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>
                            {subscription.memberName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {subscription.plan && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 9px',
                              borderRadius: 4,
                              background: `${subscription.plan.color || '#e11d48'}18`,
                              color: subscription.plan.color || '#e11d48',
                            }}
                          >
                            {subscription.plan.name}
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subscription.startDate}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{subscription.endDate}</td>
                      <td>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: subscription.amountPaid > 0 ? 'var(--success)' : 'var(--text-muted)',
                          }}
                        >
                          ${subscription.amountPaid}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${subscription.status}`}>{subscription.status}</span>
                      </td>
                      {canManage && (
                        <td>
                          <button
                            className="btn btn-icon btn-secondary btn-sm"
                            onClick={() => openEdit(subscription)}
                          >
                            <Edit2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {canManage && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editSub ? 'Edit Subscription' : 'New Subscription'}
        >
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

            <div className="form-group">
              <label className="form-label">Member *</label>
              <select
                className="form-input"
                value={form.memberId}
                onChange={(event) => setForm((prev) => ({ ...prev, memberId: event.target.value }))}
                required
                disabled={!!editSub}
              >
                <option value="">Select member...</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Plan *</label>
              <select
                className="form-input"
                value={form.planId}
                onChange={(event) => setForm((prev) => ({ ...prev, planId: event.target.value }))}
                required
              >
                <option value="">Select plan...</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price} / {plan.duration}mo
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.startDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
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
                {saving ? 'Saving...' : editSub ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
