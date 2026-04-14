// AI backend client (Django — X-User-ID header auth)
import axios from 'axios';

const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'https://x0xjlrrc15et.share.zrok.io/api/v1';

const aiClient = axios.create({ baseURL: AI_BASE_URL });

// Attach X-User-ID from stored user on every request
aiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('currentUser');
  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user?.id) config.headers['X-User-ID'] = String(user.id);
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

export default aiClient;
