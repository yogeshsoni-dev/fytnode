import client from './client';

export function normalizeTrainer(t) {
  if (!t) return t;
  return {
    ...t,
    name:   t.user?.name  || '',
    email:  t.user?.email || '',
    avatar: t.user?.name
      ? t.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : '??',
    status: (t.status || 'ACTIVE').toLowerCase(),
    members: (t.members || []).map((m) => ({
      ...m,
      name:  m.user?.name  || '',
      email: m.user?.email || '',
    })),
  };
}

export const trainersApi = {
  getAll: (params = {}) =>
    client.get('/trainers', { params }).then((r) => ({
      ...r.data,
      data: r.data.data.map(normalizeTrainer),
    })),

  getOne: (id) =>
    client.get(`/trainers/${id}`).then((r) => normalizeTrainer(r.data.data)),

  create: (data) =>
    client.post('/trainers', {
      ...data,
      status: data.status?.toUpperCase(),
    }).then((r) => normalizeTrainer(r.data.data)),

  update: (id, data) =>
    client.put(`/trainers/${id}`, {
      ...data,
      status: data.status?.toUpperCase(),
    }).then((r) => normalizeTrainer(r.data.data)),

  remove: (id) =>
    client.delete(`/trainers/${id}`),
};
