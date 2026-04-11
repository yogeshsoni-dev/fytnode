import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';
import MemberForm from './MemberForm';
import MemberDetail from './MemberDetail';
import Spinner from '../shared/Spinner';
import ErrorState from '../shared/ErrorState';
import { membersApi } from '../../api/members.api';
import { trainersApi } from '../../api/trainers.api';
import { getErrorMessage } from '../../utils/formatters';

const STATUS_FILTERS = ['all', 'active', 'expired', 'pending'];
const AVATAR_BG = ['#e11d48', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#06b6d4'];

export default function Members() {
  const [members, setMembers]   = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [showAdd, setShowAdd]     = useState(false);
  const [editMember, setEdit]     = useState(null);
  const [viewMember, setView]     = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadMembers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (search)                       params.search = search;
      if (statusFilter !== 'all')       params.status = statusFilter.toUpperCase();
      const res = await membersApi.getAll(params);
      setMembers(res.data);
      setTotal(res.meta?.total || res.data.length);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { loadMembers(); }, [loadMembers]);

  useEffect(() => {
    trainersApi.getAll({ limit: 100 })
      .then(r => setTrainers(r.data))
      .catch(() => {});
  }, []);

  const handleSave = async (data) => {
    setSaving(true); setSaveError('');
    try {
      if (editMember) {
        const updated = await membersApi.update(editMember.id, data);
        setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
        setEdit(null);
      } else {
        const created = await membersApi.create(data);
        setMembers(prev => [created, ...prev]);
        setTotal(t => t + 1);
        setShowAdd(false);
      }
    } catch (e) {
      setSaveError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await membersApi.remove(deleteId);
      setMembers(prev => prev.filter(m => m.id !== deleteId));
      setTotal(t => t - 1);
    } catch (e) {
      alert(getErrorMessage(e));
    }
  };

  const counts = {
    active:  members.filter(m => m.status === 'active').length,
    expired: members.filter(m => m.status === 'expired').length,
    pending: members.filter(m => m.status === 'pending').length,
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Members</h2>
          <p className="page-subtitle">{total} total · {counts.active} active · {counts.expired} expired · {counts.pending} pending</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEdit(null); setSaveError(''); setShowAdd(true); }}>
          <Plus size={15} /> Add Member
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search name, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatus(f)} style={{
              padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid', fontSize: 12,
              fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.04em', transition: 'all 0.18s',
              borderColor: statusFilter === f ? 'var(--red)'       : 'var(--border-soft)',
              background:  statusFilter === f ? 'var(--red-faint)' : 'var(--bg-elevated)',
              color:       statusFilter === f ? 'var(--red)'       : 'var(--text-muted)',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : error ? (
        <ErrorState message={error} onRetry={loadMembers} />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Member</th><th>Contact</th><th>Plan</th><th>Trainer</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><Search size={30} /><h3>No members found</h3><p>Adjust your search or filter</p></div></td></tr>
              ) : members.map((m, idx) => {
                const plan = m.subscriptions?.[0]?.plan;
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: AVATAR_BG[idx % AVATAR_BG.length], width: 34, height: 34, fontSize: 11 }}>{m.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{m.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.email}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.phone}</div>
                    </td>
                    <td>
                      {plan
                        ? <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 4, background: `${plan.color}18`, color: plan.color }}>{plan.name}</span>
                        : <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.trainer?.name || <span style={{ color: 'var(--text-faint)' }}>Unassigned</span>}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.joinDate}</td>
                    <td><span className={`badge badge-${m.status}`}>{m.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button className="btn btn-icon btn-secondary btn-sm" title="View"   onClick={() => setView(m)}><Eye size={13} /></button>
                        <button className="btn btn-icon btn-secondary btn-sm" title="Edit"   onClick={() => { setEdit(m); setSaveError(''); setShowAdd(true); }}><Edit2 size={13} /></button>
                        <button className="btn btn-icon btn-danger    btn-sm" title="Delete" onClick={() => setDeleteId(m.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAdd || !!editMember} onClose={() => { setShowAdd(false); setEdit(null); }} title={editMember ? 'Edit Member' : 'Add New Member'}>
        <MemberForm member={editMember} trainers={trainers} onSave={handleSave} onCancel={() => { setShowAdd(false); setEdit(null); }} saving={saving} saveError={saveError} />
      </Modal>

      <Modal isOpen={!!viewMember} onClose={() => setView(null)} title="Member Profile" size="lg">
        {viewMember && <MemberDetail member={viewMember} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Member?"
        message="This action is permanent. The member and their login account will be removed."
        confirmLabel="Delete Member"
      />
    </div>
  );
}
