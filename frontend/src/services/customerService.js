import { api } from './api';

export const customerService = {
  list: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),
  getFollowUpNotes: (id) => api.get(`/customers/${id}/follow-up-notes`),
  addFollowUpNote: (id, data) => api.post(`/customers/${id}/follow-up-notes`, data),
};
