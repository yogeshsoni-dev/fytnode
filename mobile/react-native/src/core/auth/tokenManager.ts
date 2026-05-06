import { storage } from '../storage/mmkv';

const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

export const tokenManager = {
  getAccessToken() {
    return storage.getString(ACCESS_TOKEN_KEY) ?? null;
  },
  setAccessToken(token: string | null) {
    if (token) {
      storage.set(ACCESS_TOKEN_KEY, token);
    } else {
      storage.remove(ACCESS_TOKEN_KEY);
    }
  },
  getRefreshToken() {
    return storage.getString(REFRESH_TOKEN_KEY) ?? null;
  },
  setRefreshToken(token: string | null) {
    if (token) {
      storage.set(REFRESH_TOKEN_KEY, token);
    } else {
      storage.remove(REFRESH_TOKEN_KEY);
    }
  },
  clearTokens() {
    storage.remove(ACCESS_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
  },
};
