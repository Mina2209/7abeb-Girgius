import { apiClient } from './apiClient';

export const HymnService = {
  fetch: (params) => apiClient.get('/hymns', { params }),
  create: (data) => apiClient.post('/hymns', data),
  update: (id, data) => apiClient.put(`/hymns/${id}`, data),
  delete: (id) => apiClient.delete(`/hymns/${id}`),
  getById: (id) => apiClient.get(`/hymns/${id}`),
};
