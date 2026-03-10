import { useState, useCallback } from 'react';
import { ImageService } from '../api';

export const useImageApi = () => {
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

  const fetchImages = useCallback((params) => {
    return handleApiCall(() => ImageService.fetch(params));
  }, [handleApiCall]);

  const createImage = useCallback(
    (data) => handleApiCall(() => ImageService.create(data)),
    [handleApiCall]
  );

  const updateImage = useCallback(
    (id, data) => handleApiCall(() => ImageService.update(id, data)),
    [handleApiCall]
  );

  const deleteImage = useCallback(
    (id) => handleApiCall(() => ImageService.delete(id)),
    [handleApiCall]
  );

  const fetchAuthors = useCallback(
    () => handleApiCall(() => ImageService.fetchAuthors()),
    [handleApiCall]
  );

  const createAuthor = useCallback(
    (name) => handleApiCall(() => ImageService.createAuthor(name)),
    [handleApiCall]
  );

  const deleteAuthor = useCallback(
    (id) => handleApiCall(() => ImageService.deleteAuthor(id)),
    [handleApiCall]
  );

  const fetchTypes = useCallback(
    () => handleApiCall(() => ImageService.fetchTypes()),
    [handleApiCall]
  );

  const createType = useCallback(
    (name) => handleApiCall(() => ImageService.createType(name)),
    [handleApiCall]
  );

  const deleteType = useCallback(
    (id) => handleApiCall(() => ImageService.deleteType(id)),
    [handleApiCall]
  );

  return {
    loading,
    error,
    fetchImages,
    createImage,
    updateImage,
    deleteImage,
    fetchAuthors,
    createAuthor,
    deleteAuthor,
    fetchTypes,
    createType,
    deleteType,
  };
};
