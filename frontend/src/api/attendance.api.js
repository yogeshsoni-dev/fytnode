import client from './client';

export function normalizeRecord(a) {
  if (!a) return a;
  return {
    ...a,
    date:     a.date?.split('T')[0] || '',
    checkIn:  a.checkIn  ? new Date(a.checkIn).toTimeString().slice(0, 5)  : null,
    checkOut: a.checkOut ? new Date(a.checkOut).toTimeString().slice(0, 5) : null,
    memberName: a.member?.user?.name || a.member?.name || '',
    memberAvatar: a.member?.user?.name
      ? a.member.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : '??',
  };
}

export const attendanceApi = {
  getAll: (params = {}) =>
    client.get('/attendance', { params }).then((r) => ({
      ...r.data,
      data: r.data.data.map(normalizeRecord),
    })),

  getToday: () =>
    client.get('/attendance/today').then((r) => ({
      ...r.data.data,
      records: (r.data.data.records || []).map(normalizeRecord),
    })),

  getStats: (days = 7) =>
    client.get('/attendance/stats', { params: { days } }).then((r) => r.data.data),

  getMemberHistory: (memberId, params = {}) =>
    client.get(`/attendance/member/${memberId}`, { params }).then((r) => ({
      ...r.data,
      data: r.data.data.map(normalizeRecord),
    })),

  checkIn: (memberId) =>
    client.post('/attendance/check-in', memberId ? { memberId } : {}).then((r) =>
      normalizeRecord(r.data.data)
    ),

  checkOut: (attendanceId) =>
    client.patch(`/attendance/${attendanceId}/check-out`).then((r) =>
      normalizeRecord(r.data.data)
    ),

  remove: (id) =>
    client.delete(`/attendance/${id}`),
};
