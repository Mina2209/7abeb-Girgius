export const formatDuration = (seconds) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return null;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatSize = (bytes) => {
  const value = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  const mb = value / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

export const parseOptionalInt = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};
