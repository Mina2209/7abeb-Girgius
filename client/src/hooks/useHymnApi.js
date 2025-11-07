import { useState, useCallback } from 'react';
import { HymnService } from '../api/hymnService';

export const useHymnApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unknown error';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHymns = useCallback((search) => {
    const params = search ? { q: search } : undefined;
    return handleApiCall(() => HymnService.fetch(params));
  }, [handleApiCall]);

  const createHymn = useCallback(
    (data) => handleApiCall(() => HymnService.create(data)),
    [handleApiCall]
  );

  const updateHymn = useCallback(
    (id, data) => handleApiCall(() => HymnService.update(id, data)),
    [handleApiCall]
  );

  const deleteHymn = useCallback(
    (id) => handleApiCall(() => HymnService.delete(id)),
    [handleApiCall]
  );

  return {
    loading,
    error,
    fetchHymns,
    createHymn,
    updateHymn,
    deleteHymn,
  };
};
