import { apiClient } from './apiClient';

export const LyricService = {
  // Get all lyrics (optionally filtered by hymnId)
  fetch: (params) => apiClient.get('/lyrics', { params }),
  
  // Search lyrics by query
  search: (query) => apiClient.get('/lyrics/search', { params: { q: query } }),
  
  // Get lyrics for a specific hymn
  fetchByHymnId: (hymnId) => apiClient.get(`/lyrics/hymn/${hymnId}`),
  
  // Get a single lyric by ID
  fetchById: (id) => apiClient.get(`/lyrics/${id}`),
  
  // Create a new lyric
  create: (data) => apiClient.post('/lyrics', data),
  
  // Update an existing lyric
  update: (id, data) => apiClient.put(`/lyrics/${id}`, data),
  
  // Delete a lyric
  delete: (id) => apiClient.delete(`/lyrics/${id}`),
  
  // Bulk update lyrics for a hymn (replaces all existing)
  bulkUpsert: (hymnId, lyrics) => apiClient.put(`/lyrics/hymn/${hymnId}/bulk`, { lyrics }),
};
