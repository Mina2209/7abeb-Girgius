import { apiClient } from './apiClient';

export const LyricService = {
  // Get all lyrics
  fetch: () => apiClient.get('/lyrics'),
  
  // Search lyrics by query
  search: (query) => apiClient.get('/lyrics/search', { params: { q: query } }),
  
  // Get lyric for a specific hymn
  fetchByHymnId: (hymnId) => apiClient.get(`/lyrics/hymn/${hymnId}`),
  
  // Get a single lyric by ID
  fetchById: (id) => apiClient.get(`/lyrics/${id}`),
  
  // Create or update lyric for a hymn (upsert)
  upsert: (hymnId, content) => apiClient.put(`/lyrics/hymn/${hymnId}`, { content }),
  
  // Delete lyric for a hymn
  delete: (hymnId) => apiClient.delete(`/lyrics/hymn/${hymnId}`),
};
