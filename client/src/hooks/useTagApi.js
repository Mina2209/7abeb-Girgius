import { useState, useCallback } from 'react';
import { TagService } from '../api';

export const useTagApi = () => {
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

  const fetchTags = useCallback(
    () => handleApiCall(() => TagService.fetch()),
    [handleApiCall]
  );

  const createTag = useCallback(
    (data) => handleApiCall(() => TagService.create(data)),
    [handleApiCall]
  );

  const updateTag = useCallback(
    (id, data) => handleApiCall(() => TagService.update(id, data)),
    [handleApiCall]
  );

  const deleteTag = useCallback(
    (id) => handleApiCall(() => TagService.delete(id)),
    [handleApiCall]
  );

  return {
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag
  };
};
