import client from './client';

export const attendanceApi = {
  // MEMBER role: no memberId needed — backend resolves from JWT
  checkIn: async () => {
    const { data } = await client.post('/attendance/check-in');
    return data.data;
  },

  checkOut: async (attendanceId) => {
    const { data } = await client.patch(`/attendance/${attendanceId}/check-out`);
    return data.data;
  },

  // Get history for a specific member
  getMemberHistory: async (memberId, params = {}) => {
    const { data } = await client.get(`/attendance/member/${memberId}`, { params });
    return data; // { data, total, page, limit }
  },

  // Get attendance streak for a member
  getStreak: async (memberId) => {
    const { data } = await client.get(`/attendance/member/${memberId}/streak`);
    return data.data;
  },
};
