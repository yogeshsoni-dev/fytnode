import client from './client';

export const authApi = {
  login: async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    return data.data; // { accessToken, refreshToken }
  },

  me: async () => {
    const { data } = await client.get('/auth/me');
    return data.data; // full user object with user.member.id
  },

  logout: async (refreshToken) => {
    await client.post('/auth/logout', { refreshToken });
  },
};
