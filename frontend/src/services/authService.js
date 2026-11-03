import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('tourist_safety_token', res.data.token);
      localStorage.setItem('tourist_safety_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('tourist_safety_token', res.data.token);
      localStorage.setItem('tourist_safety_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('tourist_safety_token');
    localStorage.removeItem('tourist_safety_user');
  },

  getStoredUser() {
    try {
      const u = localStorage.getItem('tourist_safety_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('tourist_safety_token');
  },
};

export default authService;
