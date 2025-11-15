// Simple auth middleware for upload routes.
// Replace with your real authentication/authorization logic.
export default function auth(req, res, next) {
  // Allow disabling auth for local/dev by setting DISABLE_AUTH=true in .env
  if (process.env.DISABLE_AUTH === 'true') return next();

  // Expect an Authorization header (Bearer token or any token) - adapt to your scheme
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // In a real app, validate token/session here and attach user to req (e.g., req.user)
  // For now, accept any non-empty Authorization header
  return next();
}
