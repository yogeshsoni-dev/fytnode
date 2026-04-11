import client from './client';

function normalizeSub(s) {
  if (!s) return s;
  return {
    ...s,
    status:    (s.status || 'ACTIVE').toLowerCase(),
    startDate: s.startDate?.split('T')[0] || '',
    endDate:   s.endDate?.split('T')[0]   || '',
    memberName: s.member?.user?.name || '',
    memberAvatar: s.member?.user?.name
      ? s.member.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : '??',
  };
}

export const subscriptionsApi = {
  getAll: (params = {}) =>
    client.get('/subscriptions', { params }).then((r) => ({
      ...r.data,
      data: r.data.data.map(normalizeSub),
    })),

  getPlans: () =>
    client.get('/subscriptions/plans').then((r) => r.data.data),

  getStats: () =>
    client.get('/subscriptions/stats').then((r) => r.data.data),

  getOne: (id) =>
    client.get(`/subscriptions/${id}`).then((r) => normalizeSub(r.data.data)),

  create: (data) =>
    client.post('/subscriptions', {
      ...data,
      status: data.status?.toUpperCase(),
    }).then((r) => normalizeSub(r.data.data)),

  update: (id, data) =>
    client.put(`/subscriptions/${id}`, {
      ...data,
      status: data.status?.toUpperCase(),
    }).then((r) => normalizeSub(r.data.data)),
};
