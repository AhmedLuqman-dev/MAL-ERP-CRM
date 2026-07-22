import { api } from './api';

export const challanService = {
  list: (params) => api.get('/challans', { params }),
  getById: (id) => api.get(`/challans/${id}`),
  create: (data) => api.post('/challans', data),
  updateStatus: (id, status) => api.patch(`/challans/${id}/status`, { status }),
};
