import { createContext, useContext, useReducer, useEffect } from "react";
import { useHymnApi } from "../hooks/useHymnApi";
import { default as UploadService } from "../api/uploadService";

const HymnContext = createContext();

const initialState = {
  hymns: [],
};

const hymnReducer = (state, action) => {
  switch (action.type) {
    case "SET_HYMNS":
      return { ...state, hymns: action.payload };

    case "ADD_HYMN":
      return { ...state, hymns: [...state.hymns, action.payload] };

    case "UPDATE_HYMN":
      return {
        ...state,
        hymns: state.hymns.map((hymn) =>
          hymn.id === action.payload.id ? action.payload : hymn
        ),
      };

    case "DELETE_HYMN":
      return {
        ...state,
        hymns: state.hymns.filter((hymn) => hymn.id !== action.payload),
      };

    default:
      return state;
  }
};

export const HymnProvider = ({ children }) => {
  const [state, dispatch] = useReducer(hymnReducer, initialState);
  const {
    loading,
    error,
    fetchHymns: apiFetchHymns,
    createHymn: apiCreateHymn,
    updateHymn: apiUpdateHymn,
    deleteHymn: apiDeleteHymn,
  } = useHymnApi();

  // --- CRUD operations ---

  const fetchHymns = async () => {
    try {
      const data = await apiFetchHymns();
      dispatch({ type: "SET_HYMNS", payload: data });
    } catch {
      // Error handled by the hook
    }
  };

  const createHymn = async (hymnData) => {
    const data = await apiCreateHymn(hymnData);
    dispatch({ type: "ADD_HYMN", payload: data });
    return data;
  };

  const updateHymn = async (id, hymnData) => {
    const data = await apiUpdateHymn(id, hymnData);
    dispatch({ type: "UPDATE_HYMN", payload: data });
    return data;
  };

  const deleteHymn = async (id) => {
    // 1. Find the hymn to get its files
    const hymn = state.hymns.find(h => h.id === id);
    if (hymn && hymn.files && hymn.files.length > 0) {
      // 2. Try to delete all associated files
      // we use map to trigger all deletes, but we don't block heavily on failures
      try {
        await Promise.allSettled(hymn.files.map(file => {
          if (file.fileUrl) {
            return UploadService.deleteFromFileUrl(file.fileUrl);
          }
          return Promise.resolve();
        }));
      } catch (err) {
        console.error("Failed to cleanup files for hymn", id, err);
      }
    }

    // 3. Delete the hymn record
    await apiDeleteHymn(id);
    dispatch({ type: "DELETE_HYMN", payload: id });
  };

  // --- Fetch on mount ---
  useEffect(() => {
    fetchHymns();
  }, []);

  const value = {
    hymns: state.hymns,
    loading,
    error,
    fetchHymns,
    createHymn,
    updateHymn,
    deleteHymn,
  };

  return <HymnContext.Provider value={value}>{children}</HymnContext.Provider>;
};

export const useHymns = () => {
  const context = useContext(HymnContext);
  if (!context) {
    throw new Error("useHymns must be used within a HymnProvider");
  }
  return context;
};
