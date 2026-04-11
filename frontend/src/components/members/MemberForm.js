import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function MemberForm({ member, trainers, onSave, onCancel, saving, saveError }) {
  const isEdit = !!member;

  const [form, setForm] = useState({
    name:      member?.name      || '',
    email:     member?.email     || '',
    password:  '',
    phone:     member?.phone     || '',
    age:       member?.age       || '',
    address:   member?.address   || '',
    status:    member?.status    || 'active',
    trainerId: member?.trainerId || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Name is required';
    if (!isEdit) {
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    }
    if (form.age && (isNaN(form.age) || +form.age < 10 || +form.age > 100)) e.age = 'Enter valid age (10–100)';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = {
      name:      form.name,
      phone:     form.phone || undefined,
      age:       form.age ? parseInt(form.age) : undefined,
      address:   form.address || undefined,
      status:    form.status,
      trainerId: form.trainerId ? parseInt(form.trainerId) : undefined,
    };
    if (!isEdit) {
      payload.email    = form.email;
      payload.password = form.password;
    }
    onSave(payload);
  };

  const field = (key) => ({
    value: form[key],
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); },
  });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {saveError && (
        <div style={{ padding: '10px 14px', background: 'var(--danger-faint)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertCircle size={14} /> {saveError}
        </div>
      )}

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" placeholder="John Doe" {...field('name')} />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Age</label>
          <input className="form-input" type="number" placeholder="25" {...field('age')} />
          {errors.age && <span className="form-error">{errors.age}</span>}
        </div>
      </div>

      {!isEdit && (
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="member@email.com" {...field('email')} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input className="form-input" type="password" placeholder="min. 6 characters" {...field('password')} />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" placeholder="555-0100" {...field('phone')} />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="form-input" placeholder="123 Main St, City" {...field('address')} />
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Assign Trainer</label>
          <select className="form-input" {...field('trainerId')}>
            <option value="">No trainer</option>
            {trainers.filter(t => t.status === 'active').map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-input" {...field('status')}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border)', marginTop: 4 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.65s linear infinite' }} /> : (isEdit ? 'Update Member' : 'Add Member')}
        </button>
      </div>
    </form>
  );
}
