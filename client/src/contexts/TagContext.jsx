import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useTagApi } from '../hooks/useTagApi';
import { normalizeArabic } from '../utils/normalizeArabic';

const TagContext = createContext();

const initialState = {
  tags: [],
  searchTerm: ''
};

const tagReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id ? action.payload : tag
        )
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload)
      };
    default:
      return state;
  }
};

export const TagProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tagReducer, initialState);
  const {
    loading,
    error,
    fetchTags: apiFetchTags,
    createTag: apiCreateTag,
    updateTag: apiUpdateTag,
    deleteTag: apiDeleteTag
  } = useTagApi();

  const fetchTags = async () => {
    try {
      const data = await apiFetchTags();
      dispatch({ type: 'SET_TAGS', payload: data });
    } catch {}
  };

  const createTag = async (tagData) => {
    const data = await apiCreateTag(tagData);
    dispatch({ type: 'ADD_TAG', payload: data });
    return data;
  };

  const updateTag = async (id, tagData) => {
    const data = await apiUpdateTag(id, tagData);
    dispatch({ type: 'UPDATE_TAG', payload: data });
    return data;
  };

  const deleteTag = async (id) => {
    await apiDeleteTag(id);
    dispatch({ type: 'DELETE_TAG', payload: id });
  };

  const setSearchTerm = (term) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <TagContext.Provider value={{ ...state, loading, error, fetchTags, createTag, updateTag, deleteTag, setSearchTerm }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTags = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTags must be used within a TagProvider');
  }
  return context;
};
