import api from './api';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async getTourists() {
    const res = await api.get('/admin/tourists');
    return res.data;
  },
};

export default adminService;
