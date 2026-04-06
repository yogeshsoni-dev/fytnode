import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Search, Edit2, Trash2, Star, Users, Award, Clock, Mail, Phone } from 'lucide-react';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';

const TRAINER_PALETTE = ['#e11d48', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#06b6d4'];

export default function Trainers() {
  const { state, dispatch } = useApp();
  const { trainers, members } = state;

  const [search, setSearch]   = useState('');
  const [showModal, setModal] = useState(false);
  const [editT, setEdit]      = useState(null);
  const [deleteId, setDel]    = useState(null);
  const [errors, setErrors]   = useState({});
  const [form, setForm]       = useState({ name: '', email: '', phone: '', specialization: '', experience: '', schedule: '', status: 'active' });

  const filtered = useMemo(() =>
    trainers.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.toLowerCase().includes(search.toLowerCase())
    ), [trainers, search]);

  const memberCount = (id) => members.filter(m => m.trainerId === id).length;

  const openAdd = () => {
    setForm({ name: '', email: '', phone: '', specialization: '', experience: '', schedule: '', status: 'active' });
    setErrors({});
    setEdit(null);
    setModal(true);
  };

  const openEdit = (t) => {
    setEdit(t);
    setErrors({});
    setForm({ name: t.name, email: t.email, phone: t.phone, specialization: t.specialization, experience: t.experience, schedule: t.schedule, status: t.status });
    setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name           = 'Required';
    if (!form.email.trim())          e.email          = 'Required';
    if (!form.specialization.trim()) e.specialization = 'Required';
    return e;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...form, experience: parseInt(form.experience) || 0, memberCount: memberCount(editT?.id || 0) };
    if (editT) {
      dispatch({ type: 'UPDATE_TRAINER', payload: { ...editT, ...payload } });
    } else {
      dispatch({ type: 'ADD_TRAINER', payload: { ...payload, id: Date.now(), avatar: form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(), rating: 4.5 } });
    }
    setModal(false);
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Trainers</h2>
          <p className="page-subtitle">{trainers.filter(t => t.status === 'active').length} active · {trainers.length} total staff</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add Trainer</button>
      </div>

      {/* Summary stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Active Trainers', value: trainers.filter(t => t.status === 'active').length, icon: Users,  color: '#e11d48', bg: 'rgba(225,29,72,0.1)' },
          { label: 'Avg Experience',  value: `${Math.round(trainers.reduce((s, t) => s + t.experience, 0) / (trainers.length || 1))}y`, icon: Award,  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
          { label: 'Avg Rating',      value: (trainers.reduce((s, t) => s + t.rating, 0) / (trainers.length || 1)).toFixed(1), icon: Star, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
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

      {/* Search */}
      <div className="filter-bar" style={{ marginBottom: 22 }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={14} className="search-icon" />
          <input className="form-input search-input" placeholder="Search by name or specialization…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Trainer cards */}
      <div className="grid-2">
        {filtered.map((trainer, idx) => {
          const color   = TRAINER_PALETTE[idx % TRAINER_PALETTE.length];
          const assigned = members.filter(m => m.trainerId === trainer.id);
          const stars   = Math.round(trainer.rating);

          return (
            <div key={trainer.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${color}`,
              borderRadius: 'var(--radius)',
              padding: 22,
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div className="avatar" style={{
                    width: 52, height: 52, fontSize: 18, fontWeight: 800,
                    background: `linear-gradient(135deg, ${color}, ${color}99)`,
                    boxShadow: `0 4px 14px ${color}30`,
                  }}>
                    {trainer.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{trainer.name}</h3>
                    <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.04em', marginBottom: 5 }}>{trainer.specialization}</div>
                    <span className={`badge badge-${trainer.status}`}>{trainer.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button className="btn btn-icon btn-secondary btn-sm" onClick={() => openEdit(trainer)}><Edit2 size={12} /></button>
                  <button className="btn btn-icon btn-danger    btn-sm" onClick={() => setDel(trainer.id)}><Trash2 size={12} /></button>
                </div>
              </div>

              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { icon: Award, label: 'Experience', value: `${trainer.experience}y` },
                  { icon: Users, label: 'Members',    value: memberCount(trainer.id) },
                  { icon: Star,  label: 'Rating',     value: trainer.rating },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '11px 8px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <Icon size={13} color={color} style={{ marginBottom: 5 }} />
                    <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={13} color={i <= stars ? color : 'var(--border-mid)'} fill={i <= stars ? color : 'transparent'} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{trainer.rating} / 5.0</span>
              </div>

              {/* Contact & schedule */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: assigned.length ? 14 : 0 }}>
                {[
                  { icon: Clock, value: trainer.schedule || 'No schedule set' },
                  { icon: Mail,  value: trainer.email },
                  { icon: Phone, value: trainer.phone },
                ].map(({ icon: Icon, value }) => (
                  <div key={value} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Icon size={12} color="var(--text-faint)" />{value}
                  </div>
                ))}
              </div>

              {/* Assigned members */}
              {assigned.length > 0 && (
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                    Assigned Members
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {assigned.map(m => (
                      <span key={m.id} style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 4, background: `${color}15`, color }}>
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state card"><Users size={30} /><h3>No trainers found</h3></div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setModal(false)} title={editT ? 'Edit Trainer' : 'Add Trainer'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Jane Smith" {...f('name')} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="trainer@gym.com" {...f('email')} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="555-0200" {...f('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Experience (years)</label>
              <input className="form-input" type="number" placeholder="5" {...f('experience')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Specialization *</label>
            <input className="form-input" placeholder="e.g. Strength & Conditioning" {...f('specialization')} />
            {errors.specialization && <span className="form-error">{errors.specialization}</span>}
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Schedule</label>
              <input className="form-input" placeholder="Mon–Fri 6AM–2PM" {...f('schedule')} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" {...f('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editT ? 'Update Trainer' : 'Add Trainer'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDel(null)}
        onConfirm={() => dispatch({ type: 'DELETE_TRAINER', payload: deleteId })}
        title="Remove Trainer?"
        message="This trainer will be removed. Assigned members will need to be reassigned."
        confirmLabel="Remove"
      />
    </div>
  );
}
