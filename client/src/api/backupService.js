import { apiClient } from './apiClient';

export const BackupService = {
  // Get list of all backups
  list: async () => {
    const response = await apiClient.get('/backup');
    return response.data;
  },
  
  // Get backup system status
  getStatus: async () => {
    const response = await apiClient.get('/backup/status');
    return response.data;
  },
  
  // Create a new backup
  create: async () => {
    const response = await apiClient.post('/backup');
    return response.data;
  },
  
  // Get download URL for a backup
  getDownloadUrl: async (key) => {
    const response = await apiClient.get('/backup/download', { params: { key } });
    return response.data;
  },
  
  // Delete a backup
  delete: async (key) => {
    const response = await apiClient.delete('/backup/delete', { params: { key } });
    return response.data;
  },
  
  // Cleanup old backups
  cleanup: async (keepCount = 7) => {
    const response = await apiClient.post('/backup/cleanup', { keepCount });
    return response.data;
  },
};
