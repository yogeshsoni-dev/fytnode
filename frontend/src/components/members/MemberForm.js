import { useState } from 'react';

export default function MemberForm({ member, trainers, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:      member?.name      || '',
    email:     member?.email     || '',
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
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (form.age && (isNaN(form.age) || +form.age < 10 || +form.age > 100)) e.age = 'Enter valid age (10–100)';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      age:       form.age       ? parseInt(form.age)       : undefined,
      trainerId: form.trainerId ? parseInt(form.trainerId) : undefined,
    });
  };

  const field = (key) => ({
    value: form[key],
    onChange: e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); },
  });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Email *</label>
          <input className="form-input" type="email" placeholder="member@email.com" {...field('email')} />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Phone *</label>
          <input className="form-input" placeholder="555-0100" {...field('phone')} />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Address</label>
        <input className="form-input" placeholder="123 Main St, City" {...field('address')} />
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
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{member ? 'Update Member' : 'Add Member'}</button>
      </div>
    </form>
  );
}
