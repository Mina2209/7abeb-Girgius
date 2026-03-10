import { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { useImageApi } from "../hooks/useImageApi";
import { default as UploadService } from "../api/uploadService";

const ImageContext = createContext();

const initialState = {
  images: [],
  total: 0,
  page: 1,
  limit: 20,
  authors: [],
  types: [],
};

const imageReducer = (state, action) => {
  switch (action.type) {
    case "SET_IMAGES":
      return {
        ...state,
        images: action.payload.data,
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
      };

    case "ADD_IMAGE":
      return {
        ...state,
        images: [action.payload, ...state.images],
        total: state.total + 1,
      };

    case "UPDATE_IMAGE":
      return {
        ...state,
        images: state.images.map((img) =>
          img.id === action.payload.id ? action.payload : img
        ),
      };

    case "DELETE_IMAGE":
      return {
        ...state,
        images: state.images.filter((img) => img.id !== action.payload),
        total: state.total - 1,
      };

    case "SET_AUTHORS":
      return { ...state, authors: action.payload };

    case "ADD_AUTHOR":
      return { ...state, authors: [...state.authors, action.payload] };

    case "DELETE_AUTHOR":
      return {
        ...state,
        authors: state.authors.filter((a) => a.id !== action.payload),
      };

    case "SET_TYPES":
      return { ...state, types: action.payload };

    case "ADD_TYPE":
      return { ...state, types: [...state.types, action.payload] };

    case "DELETE_TYPE":
      return {
        ...state,
        types: state.types.filter((t) => t.id !== action.payload),
      };

    default:
      return state;
  }
};

export const ImageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(imageReducer, initialState);
  const {
    loading,
    error,
    fetchImages: apiFetchImages,
    createImage: apiCreateImage,
    updateImage: apiUpdateImage,
    deleteImage: apiDeleteImage,
    fetchAuthors: apiFetchAuthors,
    createAuthor: apiCreateAuthor,
    deleteAuthor: apiDeleteAuthor,
    fetchTypes: apiFetchTypes,
    createType: apiCreateType,
    deleteType: apiDeleteType,
  } = useImageApi();

  // --- CRUD operations ---

  const fetchImages = useCallback(async (params = {}) => {
    try {
      const data = await apiFetchImages(params);
      dispatch({ type: "SET_IMAGES", payload: data });
      return data;
    } catch {
      // Error handled by the hook
    }
  }, [apiFetchImages]);

  const createImage = async (imageData) => {
    const data = await apiCreateImage(imageData);
    dispatch({ type: "ADD_IMAGE", payload: data });
    return data;
  };

  const updateImage = async (id, imageData) => {
    const data = await apiUpdateImage(id, imageData);
    dispatch({ type: "UPDATE_IMAGE", payload: data });
    return data;
  };

  const deleteImage = async (id) => {
    // Try to delete associated S3 file
    const image = state.images.find((img) => img.id === id);
    if (image && image.imageUrl) {
      try {
        await UploadService.deleteFromFileUrl(image.imageUrl);
      } catch (err) {
        console.error("Failed to cleanup image file", id, err);
      }
    }

    await apiDeleteImage(id);
    dispatch({ type: "DELETE_IMAGE", payload: id });
  };

  // --- Author management ---

  const loadAuthors = useCallback(async () => {
    try {
      const data = await apiFetchAuthors();
      dispatch({ type: "SET_AUTHORS", payload: data });
    } catch {
      // Error handled by the hook
    }
  }, [apiFetchAuthors]);

  const addAuthor = async (name) => {
    const data = await apiCreateAuthor(name);
    dispatch({ type: "ADD_AUTHOR", payload: data });
    return data;
  };

  const removeAuthor = async (id) => {
    await apiDeleteAuthor(id);
    dispatch({ type: "DELETE_AUTHOR", payload: id });
  };

  // --- Type management ---

  const loadTypes = useCallback(async () => {
    try {
      const data = await apiFetchTypes();
      dispatch({ type: "SET_TYPES", payload: data });
    } catch {
      // Error handled by the hook
    }
  }, [apiFetchTypes]);

  const addType = async (name) => {
    const data = await apiCreateType(name);
    dispatch({ type: "ADD_TYPE", payload: data });
    return data;
  };

  const removeType = async (id) => {
    await apiDeleteType(id);
    dispatch({ type: "DELETE_TYPE", payload: id });
  };

  // --- Fetch on mount ---
  useEffect(() => {
    fetchImages({ page: 1, limit: 20 });
    loadAuthors();
    loadTypes();
  }, []);

  const value = {
    images: state.images,
    total: state.total,
    page: state.page,
    limit: state.limit,
    authors: state.authors,
    types: state.types,
    loading,
    error,
    fetchImages,
    createImage,
    updateImage,
    deleteImage,
    loadAuthors,
    addAuthor,
    removeAuthor,
    loadTypes,
    addType,
    removeType,
  };

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
};

export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImages must be used within an ImageProvider");
  }
  return context;
};
