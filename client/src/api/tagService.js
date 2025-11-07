import { apiClient } from './apiClient';

export const TagService = {
  fetch: () => apiClient.get('/tags'),
  create: (data) => apiClient.post('/tags', data),
  update: (id, data) => apiClient.put(`/tags/${id}`, data),
  delete: (id) => apiClient.delete(`/tags/${id}`),
};
