// Central API configuration for the frontend
// Exposes API_BASE so other modules can construct URLs consistently

// Use Vite env `VITE_API_URL` for direct-backend calls, fallback to '/api' for local proxy
export const getApiBase = () => import.meta.env.VITE_API_URL || '/api';

// Normalize API base so it always refers to the API root (ends with '/api')
export const normalizeApiBase = (raw) => {
	if (!raw) return '/api';
	// trim whitespace
	let base = String(raw).trim();
	// remove trailing slash if present
	if (base.endsWith('/')) base = base.slice(0, -1);
	// if already ends with '/api', return as-is
	if (base.endsWith('/api')) return base;
	// if base is just the root placeholder '/', return '/api'
	if (base === '') return '/api';
	// otherwise append '/api'
	return `${base}/api`;
};

export const API_BASE = normalizeApiBase(getApiBase());

// Optional: expose proxy target name for vite config or tooling
export const getProxyTarget = () => import.meta.env.VITE_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://localhost:4000';

export default { API_BASE, getApiBase, getProxyTarget };
