import { api } from './api';

export const challanService = {
  list: (params) => api.get('/api/challans', { params }),
  getById: (id) => api.get(`/api/challans/${id}`),
  create: (data) => api.post('/api/challans', data),
  updateStatus: (id, status) => api.patch(`/api/challans/${id}/status`, { status }),
};
