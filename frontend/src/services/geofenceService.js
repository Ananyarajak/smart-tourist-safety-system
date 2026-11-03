import api from './api';

export const geofenceService = {
  async getGeofences(params = {}) {
    const res = await api.get('/geofences', { params });
    return res.data;
  },

  async createGeofence(geofenceData) {
    const res = await api.post('/geofences', geofenceData);
    return res.data;
  },

  async updateGeofence(id, geofenceData) {
    const res = await api.put(`/geofences/${id}`, geofenceData);
    return res.data;
  },

  async deleteGeofence(id) {
    const res = await api.delete(`/geofences/${id}`);
    return res.data;
  },

  async getGeofenceLogs() {
    const res = await api.get('/geofences/events');
    return res.data;
  },
};

export default geofenceService;
