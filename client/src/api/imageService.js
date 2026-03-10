import { apiClient } from './apiClient';

export const ImageService = {
  fetch: (params) => apiClient.get('/images', { params }),
  getById: (id) => apiClient.get(`/images/${id}`),
  create: (data) => apiClient.post('/images', data),
  update: (id, data) => apiClient.put(`/images/${id}`, data),
  delete: (id) => apiClient.delete(`/images/${id}`),
  fetchAuthors: () => apiClient.get('/images/meta/authors'),
  createAuthor: (name) => apiClient.post('/images/meta/authors', { name }),
  deleteAuthor: (id) => apiClient.delete(`/images/meta/authors/${id}`),
  fetchTypes: () => apiClient.get('/images/meta/types'),
  createType: (name) => apiClient.post('/images/meta/types', { name }),
  deleteType: (id) => apiClient.delete(`/images/meta/types/${id}`),
};
