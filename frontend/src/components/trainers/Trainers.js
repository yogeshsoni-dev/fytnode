import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  Clock,
  Edit2,
  Mail,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { trainersApi } from '../../api/trainers.api';
import { getErrorMessage } from '../../utils/formatters';
import ConfirmDialog from '../shared/ConfirmDialog';
import ErrorState from '../shared/ErrorState';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

const TRAINER_PALETTE = ['#e11d48', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#06b6d4'];

export default function Trainers() {
  const { state } = useApp();
  const isAdmin = state.currentUser?.role === 'ADMIN';

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    experience: '',
    schedule: '',
    status: 'active',
  });

  const loadTrainers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await trainersApi.getAll({ limit: 100 });
      setTrainers(res.data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrainers();
  }, [loadTrainers]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return trainers;

    return trainers.filter((trainer) => {
      const name = trainer.name?.toLowerCase() || '';
      const specialization = trainer.specialization?.toLowerCase() || '';
      return name.includes(query) || specialization.includes(query);
    });
  }, [search, trainers]);

  const activeCount = trainers.filter((trainer) => trainer.status === 'active').length;
  const avgExperience = Math.round(
    trainers.reduce((sum, trainer) => sum + (trainer.experience || 0), 0) / (trainers.length || 1)
  );
  const avgRating = (
    trainers.reduce((sum, trainer) => sum + (trainer.rating || 0), 0) / (trainers.length || 1)
  ).toFixed(1);

  const openAdd = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      specialization: '',
      experience: '',
      schedule: '',
      status: 'active',
    });
    setErrors({});
    setSaveError('');
    setEditTrainer(null);
    setShowModal(true);
  };

  const openEdit = (trainer) => {
    setForm({
      name: trainer.name || '',
      email: trainer.email || '',
      password: '',
      phone: trainer.phone || '',
      specialization: trainer.specialization || '',
      experience: trainer.experience != null ? String(trainer.experience) : '',
      schedule: trainer.schedule || '',
      status: trainer.status || 'active',
    });
    setErrors({});
    setSaveError('');
    setEditTrainer(trainer);
    setShowModal(true);
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Required';
    if (!form.email.trim()) nextErrors.email = 'Required';
    if (!form.specialization.trim()) nextErrors.specialization = 'Required';
    if (!editTrainer && !form.password.trim()) nextErrors.password = 'Required';
    if (!editTrainer && form.password && form.password.length < 6) {
      nextErrors.password = 'Minimum 6 characters';
    }

    return nextErrors;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        specialization: form.specialization.trim(),
        experience: form.experience ? parseInt(form.experience, 10) : 0,
        schedule: form.schedule.trim() || undefined,
        status: form.status,
      };

      if (editTrainer) {
        await trainersApi.update(editTrainer.id, payload);
      } else {
        await trainersApi.create({
          ...payload,
          password: form.password,
        });
      }

      setShowModal(false);
      await loadTrainers();
    } catch (saveActionError) {
      setSaveError(getErrorMessage(saveActionError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await trainersApi.remove(deleteId);
      setDeleteId(null);
      await loadTrainers();
    } catch (deleteError) {
      setSaveError(getErrorMessage(deleteError));
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (event) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
    },
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Trainers</h2>
          <p className="page-subtitle">{activeCount} active | {trainers.length} total staff</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add Trainer
          </button>
        )}
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        {[
          {
            label: 'Active Trainers',
            value: activeCount,
            icon: Users,
            color: '#e11d48',
            bg: 'rgba(225,29,72,0.1)',
          },
          {
            label: 'Avg Experience',
            value: `${avgExperience}y`,
            icon: Award,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.1)',
          },
          {
            label: 'Avg Rating',
            value: avgRating,
            icon: Star,
            color: '#22c55e',
            bg: 'rgba(34,197,94,0.1)',
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

      <div className="filter-bar" style={{ marginBottom: 22 }}>
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <Search size={14} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTrainers} />
      ) : (
        <>
          <div className="grid-2">
            {filtered.map((trainer, index) => {
              const color = TRAINER_PALETTE[index % TRAINER_PALETTE.length];
              const assignedMembers = trainer.members || [];
              const stars = Math.round(trainer.rating || 0);

              return (
                <div
                  key={trainer.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderTop: `3px solid ${color}`,
                    borderRadius: 'var(--radius)',
                    padding: 22,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div
                        className="avatar"
                        style={{
                          width: 52,
                          height: 52,
                          fontSize: 18,
                          fontWeight: 800,
                          background: `linear-gradient(135deg, ${color}, ${color}99)`,
                          boxShadow: `0 4px 14px ${color}30`,
                        }}
                      >
                        {trainer.avatar}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 3 }}>
                          {trainer.name}
                        </h3>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color,
                            letterSpacing: '0.04em',
                            marginBottom: 5,
                          }}
                        >
                          {trainer.specialization}
                        </div>
                        <span className={`badge badge-${trainer.status}`}>{trainer.status}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          className="btn btn-icon btn-secondary btn-sm"
                          onClick={() => openEdit(trainer)}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn-icon btn-danger btn-sm"
                          onClick={() => setDeleteId(trainer.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3,1fr)',
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      { icon: Award, label: 'Experience', value: `${trainer.experience || 0}y` },
                      { icon: Users, label: 'Members', value: assignedMembers.length },
                      { icon: Star, label: 'Rating', value: trainer.rating || 0 },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        style={{
                          textAlign: 'center',
                          padding: '11px 8px',
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Icon size={13} color={color} style={{ marginBottom: 5 }} />
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#fff' }}>{value}</div>
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            marginTop: 2,
                          }}
                        >
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={13}
                        color={value <= stars ? color : 'var(--border-mid)'}
                        fill={value <= stars ? color : 'transparent'}
                      />
                    ))}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
                      {trainer.rating || 0} / 5.0
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: assignedMembers.length ? 14 : 0 }}>
                    {[
                      { icon: Clock, value: trainer.schedule || 'No schedule set' },
                      { icon: Mail, value: trainer.email || 'No email set' },
                      { icon: Phone, value: trainer.phone || 'No phone set' },
                    ].map(({ icon: Icon, value }) => (
                      <div
                        key={`${trainer.id}-${value}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}
                      >
                        <Icon size={12} color="var(--text-faint)" />
                        {value}
                      </div>
                    ))}
                  </div>

                  {assignedMembers.length > 0 && (
                    <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          marginBottom: 8,
                        }}
                      >
                        Assigned Members
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {assignedMembers.map((member) => (
                          <span
                            key={member.id}
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '3px 9px',
                              borderRadius: 4,
                              background: `${color}15`,
                              color,
                            }}
                          >
                            {member.name}
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
            <div className="empty-state card">
              <Users size={30} />
              <h3>No trainers found</h3>
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editTrainer ? 'Edit Trainer' : 'Add Trainer'}
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

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Jane Smith" {...field('name')} />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="trainer@gym.com" {...field('email')} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>

            {!editTrainer && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Minimum 6 characters" {...field('password')} />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="555-0200" {...field('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Experience (years)</label>
                <input className="form-input" type="number" placeholder="5" {...field('experience')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input className="form-input" placeholder="Strength & Conditioning" {...field('specialization')} />
              {errors.specialization && <span className="form-error">{errors.specialization}</span>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Schedule</label>
                <input className="form-input" placeholder="Mon-Fri 6AM-2PM" {...field('schedule')} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" {...field('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                {saving ? 'Saving...' : editTrainer ? 'Update Trainer' : 'Add Trainer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isAdmin && (
        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Remove Trainer?"
          message="This trainer will be removed. Assigned members will need to be reassigned."
          confirmLabel="Remove"
        />
      )}
    </div>
  );
}
