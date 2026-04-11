import client from './client';

function normalizeNotif(n) {
  if (!n) return n;
  return {
    ...n,
    type:     (n.type     || 'ANNOUNCEMENT').toLowerCase(),
    priority: (n.priority || 'LOW').toLowerCase(),
    date:     n.createdAt?.split('T')[0] || '',
  };
}

export const notificationsApi = {
  getAll: (params = {}) =>
    client.get('/notifications', { params }).then((r) => ({
      ...r.data,
      data: r.data.data.map(normalizeNotif),
      unreadCount: r.data.meta?.unreadCount ?? 0,
    })),

  create: (data) =>
    client.post('/notifications', {
      ...data,
      type:     data.type?.toUpperCase(),
      priority: data.priority?.toUpperCase(),
    }).then((r) => normalizeNotif(r.data.data)),

  markRead: (id) =>
    client.patch(`/notifications/${id}/read`).then((r) => normalizeNotif(r.data.data)),

  markAllRead: () =>
    client.patch('/notifications/mark-all-read'),

  remove: (id) =>
    client.delete(`/notifications/${id}`),
};
