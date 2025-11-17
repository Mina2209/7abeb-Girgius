// Central API configuration for the frontend
// Exposes API_BASE so other modules can construct URLs consistently

// Use Vite env `VITE_API_URL` for direct-backend calls, fallback to '/api' for local proxy
export const getApiBase = () => import.meta.env.VITE_API_URL || '/api';

export const API_BASE = getApiBase();

// Optional: expose proxy target name for vite config or tooling
export const getProxyTarget = () => import.meta.env.VITE_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost:4000';

export default { API_BASE, getApiBase, getProxyTarget };
