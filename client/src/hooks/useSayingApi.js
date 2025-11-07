import { useState, useCallback } from 'react';
import { SayingService } from '../api/sayingService';

export const useSayingApi = () => {
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

  const fetchSayings = useCallback((search) => {
    const params = search ? { q: search } : undefined;
    return handleApiCall(() => SayingService.fetch(params));
  }, [handleApiCall]);

  const createSaying = useCallback(
    (data) => handleApiCall(() => SayingService.create(data)),
    [handleApiCall]
  );

  const updateSaying = useCallback(
    (id, data) => handleApiCall(() => SayingService.update(id, data)),
    [handleApiCall]
  );

  const deleteSaying = useCallback(
    (id) => handleApiCall(() => SayingService.delete(id)),
    [handleApiCall]
  );

  return {
    loading,
    error,
    fetchSayings,
    createSaying,
    updateSaying,
    deleteSaying,
  };
};
