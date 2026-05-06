import axios from 'axios';
import { getEnv } from '../config/env';
import { tokenManager } from '../auth/tokenManager';

const { apiUrl } = getEnv();

export const httpClient = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
});

httpClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
