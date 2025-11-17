import axios from 'axios';
import { API_BASE } from '../config/apiConfig';

// axios instance used across the app — baseURL uses centralized API_BASE
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
