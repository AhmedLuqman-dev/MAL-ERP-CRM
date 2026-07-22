import { api } from './api';

export const productService = {
  list: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
  getMovements: (params) => api.get('/products/inventory/movements', { params }),
  addMovement: (data) => api.post('/products/inventory/movements', data),
};
