import client from './client';

export const authApi = {
  getGyms: async () => {
    const { data } = await client.get('/auth/gyms');
    return data.data; // [{ id, name, address }]
  },

  memberSignup: async (fields) => {
    const { data } = await client.post('/auth/member-signup', fields);
    return data.data; // { user, accessToken, refreshToken }
  },

  login: async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    return data.data; // { user, accessToken, refreshToken }
  },

  me: async () => {
    const { data } = await client.get('/auth/me');
    return data.data; // full user object with user.member.id
  },

  logout: async (refreshToken) => {
    await client.post('/auth/logout', { refreshToken });
  },
};
