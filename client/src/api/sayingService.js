import { apiClient } from './apiClient';

export const SayingService = {
  fetch: (params) => apiClient.get('/sayings', { params }),
  create: (data) => apiClient.post('/sayings', data),
  update: (id, data) => apiClient.put(`/sayings/${id}`, data),
  delete: (id) => apiClient.delete(`/sayings/${id}`),
};
