import { createContext, useContext, useReducer, useEffect } from "react";
import { useSayingApi } from "../hooks/useSayingApi";

const SayingContext = createContext();

const initialState = {
  sayings: [],
};

const sayingReducer = (state, action) => {
  switch (action.type) {
    case "SET_SAYINGS":
      return { ...state, sayings: action.payload };

    case "ADD_SAYING":
      return { ...state, sayings: [...state.sayings, action.payload] };

    case "UPDATE_SAYING":
      return {
        ...state,
        sayings: state.sayings.map((saying) =>
          saying.id === action.payload.id ? action.payload : saying
        ),
      };

    case "DELETE_SAYING":
      return {
        ...state,
        sayings: state.sayings.filter((saying) => saying.id !== action.payload),
      };

    default:
      return state;
  }
};

export const SayingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sayingReducer, initialState);
  const {
    loading,
    error,
    fetchSayings: apiFetchSayings,
    createSaying: apiCreateSaying,
    updateSaying: apiUpdateSaying,
    deleteSaying: apiDeleteSaying,
  } = useSayingApi();

  // --- CRUD operations ---

  const fetchSayings = async () => {
    try {
      const data = await apiFetchSayings();
      dispatch({ type: "SET_SAYINGS", payload: data });
    } catch {
      // Error handled by the hook
    }
  };

  const createSaying = async (sayingData) => {
    const data = await apiCreateSaying(sayingData);
    dispatch({ type: "ADD_SAYING", payload: data });
    return data;
  };

  const updateSaying = async (id, sayingData) => {
    const data = await apiUpdateSaying(id, sayingData);
    dispatch({ type: "UPDATE_SAYING", payload: data });
    return data;
  };

  const deleteSaying = async (id) => {
    await apiDeleteSaying(id);
    dispatch({ type: "DELETE_SAYING", payload: id });
  };

  // --- Fetch on mount ---
  useEffect(() => {
    fetchSayings();
  }, []);

  const value = {
    sayings: state.sayings,
    loading,
    error,
    fetchSayings,
    createSaying,
    updateSaying,
    deleteSaying,
  };

  return <SayingContext.Provider value={value}>{children}</SayingContext.Provider>;
};

export const useSayings = () => {
  const context = useContext(SayingContext);
  if (!context) {
    throw new Error("useSayings must be used within a SayingProvider");
  }
  return context;
};
