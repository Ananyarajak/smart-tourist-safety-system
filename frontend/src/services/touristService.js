import api from './api';

export const touristService = {
  async getProfile() {
    const res = await api.get('/tourist/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/tourist/profile', data);
    return res.data;
  },

  async sendLocation(locationData) {
    const res = await api.post('/tourist/location', locationData);
    return res.data;
  },

  async toggleTracking(isTrackingActive) {
    const res = await api.post('/tourist/tracking/toggle', { isTrackingActive });
    return res.data;
  },

  async getLocationHistory(limit = 50, touristId = null) {
    const query = touristId ? `?limit=${limit}&touristId=${touristId}` : `?limit=${limit}`;
    const res = await api.get(`/tourist/location/history${query}`);
    return res.data;
  },
};

export default touristService;
