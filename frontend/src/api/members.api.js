import client from './client';

// ── Normalize backend member → frontend-friendly shape ────────────────────────
export function normalizeMember(m) {
  if (!m) return m;
  return {
    ...m,
    name:     m.user?.name  || '',
    email:    m.user?.email || '',
    avatar:   m.user?.name
      ? m.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : '??',
    status:   (m.status || 'ACTIVE').toLowerCase(),
    joinDate: m.joinDate ? m.joinDate.split('T')[0] : '',
    trainer: m.trainer ? {
      ...m.trainer,
      name:  m.trainer.user?.name  || '',
      email: m.trainer.user?.email || '',
      status: (m.trainer.status || 'ACTIVE').toLowerCase(),
    } : null,
    subscriptions: (m.subscriptions || []).map((s) => ({
      ...s,
      startDate: s.startDate?.split('T')[0] || '',
      endDate:   s.endDate?.split('T')[0]   || '',
      status:    (s.status || 'ACTIVE').toLowerCase(),
    })),
    attendance: (m.attendance || []).map((a) => ({
      ...a,
      date:     a.date?.split('T')[0] || '',
      checkIn:  a.checkIn  ? new Date(a.checkIn).toTimeString().slice(0, 5)  : null,
      checkOut: a.checkOut ? new Date(a.checkOut).toTimeString().slice(0, 5) : null,
    })),
  };
}

export const membersApi = {
  getAll: (params = {}) =>
    client.get('/members', { params }).then((r) => ({
      ...r.data,
      data: r.data.data.map(normalizeMember),
    })),

  getOne: (id) =>
    client.get(`/members/${id}`).then((r) => normalizeMember(r.data.data)),

  create: (data) =>
    client.post('/members', {
      ...data,
      status: data.status?.toUpperCase(),
    }).then((r) => normalizeMember(r.data.data)),

  update: (id, data) =>
    client.put(`/members/${id}`, {
      ...data,
      status: data.status?.toUpperCase(),
    }).then((r) => normalizeMember(r.data.data)),

  remove: (id) =>
    client.delete(`/members/${id}`),
};
