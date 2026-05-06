import { httpClient } from '../../../core/api/httpClient';

type LoginPayload = {
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const { data } = await httpClient.post('/auth/login', payload);
  return data;
}

export async function refreshToken(refreshTokenValue: string) {
  const { data } = await httpClient.post('/auth/refresh', { refreshToken: refreshTokenValue });
  return data;
}
