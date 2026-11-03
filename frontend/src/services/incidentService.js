import api from './api';

export const incidentService = {
  async createIncident(incidentData) {
    const res = await api.post('/incidents', incidentData);
    return res.data;
  },

  async getMyIncidents() {
    const res = await api.get('/incidents/my');
    return res.data;
  },

  async getAllIncidents(params = {}) {
    const res = await api.get('/incidents', { params });
    return res.data;
  },

  async getIncidentById(id) {
    const res = await api.get(`/incidents/${id}`);
    return res.data;
  },

  async updateIncidentStatus(id, updateData) {
    const res = await api.put(`/incidents/${id}/status`, updateData);
    return res.data;
  },

  async cancelSosAlert(id, reason) {
    const res = await api.put(`/incidents/${id}/cancel`, { reason });
    return res.data;
  },
};

export default incidentService;
