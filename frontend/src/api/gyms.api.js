import client from './client';

function normalizeGym(gym) {
  return {
    ...gym,
    admin: gym.users?.[0] || null,
    memberCount: gym._count?.members ?? 0,
    trainerCount: gym._count?.trainers ?? 0,
  };
}

export const gymsApi = {
  getAll: async (params = {}) => {
    const res = await client.get('/gyms', { params });
    return {
      data: res.data.data.map(normalizeGym),
      meta: res.data.meta,
    };
  },

  getOne: async (id) => {
    const res = await client.get(`/gyms/${id}`);
    return normalizeGym(res.data.data);
  },

  getStats: async (id) => {
    const res = await client.get(`/gyms/${id}/stats`);
    return res.data.data;
  },

  create: async (payload) => {
    const res = await client.post('/gyms', payload);
    return normalizeGym(res.data.data);
  },

  update: async (id, payload) => {
    const res = await client.put(`/gyms/${id}`, payload);
    return normalizeGym(res.data.data);
  },

  remove: async (id) => {
    await client.delete(`/gyms/${id}`);
  },
};
