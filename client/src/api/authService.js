import apiClient from './apiClient';

export const authService = {
  async login(username, password) {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  async getAllUsers() {
    const response = await apiClient.get('/auth/users');
    return response.data;
  },

  async getUserById(id) {
    const response = await apiClient.get(`/auth/users/${id}`);
    return response.data;
  },

  async createUser(userData) {
    const response = await apiClient.post('/auth/users', userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await apiClient.put(`/auth/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    await apiClient.delete(`/auth/users/${id}`);
  },

  async getAllLogs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.entity) params.append('entity', filters.entity);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await apiClient.get(`/auth/logs?${params.toString()}`);
    return response.data;
  },

  async getLogsByUserId(userId) {
    const response = await apiClient.get(`/auth/logs/user/${userId}`);
    return response.data;
  }
};
