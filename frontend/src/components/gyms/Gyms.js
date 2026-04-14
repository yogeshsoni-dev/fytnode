import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  UserCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { gymsApi } from '../../api/gyms.api';
import { getErrorMessage } from '../../utils/formatters';
import ConfirmDialog from '../shared/ConfirmDialog';
import ErrorState from '../shared/ErrorState';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

export default function Gyms() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editGym, setEditGym] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '', isActive: true });

  const loadGyms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await gymsApi.getAll({ limit: 100 });
      setGyms(res.data);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGyms(); }, [loadGyms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return gyms;
    return gyms.filter((g) => g.name.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q));
  }, [search, gyms]);

  const activeCount = gyms.filter((g) => g.isActive).length;

  const openAdd = () => {
    setForm({ name: '', address: '', phone: '', email: '', isActive: true });
    setErrors({});
    setSaveError('');
    setEditGym(null);
    setShowModal(true);
  };

  const openEdit = (gym) => {
    setForm({
      name: gym.name || '',
      address: gym.address || '',
      phone: gym.phone || '',
      email: gym.email || '',
      isActive: gym.isActive,
    });
    setErrors({});
    setSaveError('');
    setEditGym(gym);
    setShowModal(true);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Invalid email';
    return next;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        isActive: form.isActive,
      };
      if (editGym) {
        await gymsApi.update(editGym.id, payload);
      } else {
        await gymsApi.create(payload);
      }
      setShowModal(false);
      await loadGyms();
    } catch (e) {
      setSaveError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await gymsApi.remove(deleteId);
      setDeleteId(null);
      await loadGyms();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
    },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Gyms</h2>
          <p className="page-subtitle">{activeCount} active · {gyms.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={15} /> New Gym
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Gyms',    value: gyms.length,   icon: Building2,  color: '#e11d48', bg: 'rgba(225,29,72,0.1)' },
          { label: 'Active Gyms',   value: activeCount,   icon: ToggleRight, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Inactive Gyms', value: gyms.length - activeCount, icon: ToggleLeft, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card" style={{ '--accent-color': color }}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={18} color={color} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: 22 }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={14} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={loadGyms} />
      ) : (
        <>
          <div className="grid-2">
            {filtered.map((gym) => (
              <div
                key={gym.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderTop: `3px solid ${gym.isActive ? 'var(--red)' : 'var(--border-mid)'}`,
                  borderRadius: 'var(--radius)',
                  padding: 22,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 10,
                      background: gym.isActive ? 'rgba(225,29,72,0.12)' : 'rgba(107,114,128,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Building2 size={20} color={gym.isActive ? 'var(--red)' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {gym.name}
                      </h3>
                      <span className={`badge badge-${gym.isActive ? 'active' : 'expired'}`}>
                        {gym.isActive ? 'active' : 'inactive'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEdit(gym)}>
                      <Edit2 size={12} />
                    </button>
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => setDeleteId(gym.id)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { icon: Users,     label: 'Members',  value: gym.memberCount },
                    { icon: UserCheck, label: 'Trainers', value: gym.trainerCount },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '10px 8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <Icon size={13} color="var(--red)" style={{ marginBottom: 4 }} />
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{value}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {gym.address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                      <MapPin size={12} color="var(--text-faint)" /> {gym.address}
                    </div>
                  )}
                  {gym.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Phone size={12} color="var(--text-faint)" /> {gym.phone}
                    </div>
                  )}
                  {gym.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                      <Mail size={12} color="var(--text-faint)" /> {gym.email}
                    </div>
                  )}
                </div>

                {gym.admin && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Admin</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
                        {gym.admin.name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{gym.admin.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{gym.admin.email}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state card">
              <Building2 size={30} />
              <h3>No gyms found</h3>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editGym ? 'Edit Gym' : 'New Gym'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {saveError && (
            <div style={{ padding: '10px 14px', background: 'var(--danger-faint)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13 }}>
              {saveError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Gym Name *</label>
            <input className="form-input" placeholder="FitZone Elite" {...field('name')} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="555-0100" {...field('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="gym@example.com" {...field('email')} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" placeholder="100 Fitness Blvd, Downtown" {...field('address')} />
          </div>

          {editGym && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={form.isActive ? 'true' : 'false'}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === 'true' }))}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editGym ? 'Update Gym' : 'Create Gym'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Gym?"
        message="This will permanently delete the gym and all its data (members, trainers, attendance). This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
