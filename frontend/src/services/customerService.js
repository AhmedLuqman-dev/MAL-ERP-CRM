import { api } from './api';

export const customerService = {
  list: (params) => api.get('/api/customers', { params }),
  getById: (id) => api.get(`/api/customers/${id}`),
  create: (data) => api.post('/api/customers', data),
  update: (id, data) => api.put(`/api/customers/${id}`, data),
  remove: (id) => api.delete(`/api/customers/${id}`),
  getFollowUpNotes: (id) => api.get(`/api/customers/${id}/follow-up-notes`),
  addFollowUpNote: (id, data) => api.post(`/api/customers/${id}/follow-up-notes`, data),
};
