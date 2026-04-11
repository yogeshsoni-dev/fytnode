import client from './client';

export const authApi = {
  signup: (payload) =>
    client.post('/auth/signup', payload).then((r) => r.data.data),

  login: (email, password) =>
    client.post('/auth/login', { email, password }).then((r) => r.data.data),

  logout: (refreshToken) =>
    client.post('/auth/logout', { refreshToken }),

  refresh: (refreshToken) =>
    client.post('/auth/refresh', { refreshToken }).then((r) => r.data.data),

  me: () =>
    client.get('/auth/me').then((r) => r.data.data),
};
