import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const idleTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Reset idle timer on activity
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('lastActivity', Date.now().toString());

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (token && user) {
      idleTimerRef.current = setTimeout(() => {
        // Session expired due to inactivity
        setSessionExpired(true);
      }, IDLE_TIMEOUT_MS);
    }
  }, [token, user]);

  // Check for stored session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    const lastActivity = localStorage.getItem('lastActivity');

    if (storedToken && storedUser) {
      // Check if session should be expired due to idle time
      const timeSinceActivity = Date.now() - parseInt(lastActivity || '0', 10);

      if (lastActivity && timeSinceActivity > IDLE_TIMEOUT_MS) {
        // Session was idle too long, show expired modal
        setSessionExpired(true);
        setLoading(false);
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        lastActivityRef.current = parseInt(lastActivity || Date.now().toString(), 10);
      }
    }
    setLoading(false);
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (!token || !user) return;

    const handleActivity = () => {
      resetIdleTimer();
    };

    // Add activity listeners
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Start idle timer
    resetIdleTimer();

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if session expired while tab was hidden
        const lastActivity = parseInt(localStorage.getItem('lastActivity') || '0', 10);
        const timeSinceActivity = Date.now() - lastActivity;

        if (timeSinceActivity > IDLE_TIMEOUT_MS) {
          setSessionExpired(true);
        } else {
          resetIdleTimer();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [token, user, resetIdleTimer]);

  // Listen for session expired events from apiClient
  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpired(true);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { token: newToken, user: newUser } = response;

      setToken(newToken);
      setUser(newUser);
      setSessionExpired(false);

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      localStorage.setItem('lastActivity', Date.now().toString());

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSessionExpired(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('lastActivity');

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
  }, []);

  const dismissSessionExpired = () => {
    setSessionExpired(false);
    logout();
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isEditor = () => user?.role === 'EDITOR' || user?.role === 'ADMIN';
  const isAuthenticated = () => !!token && !!user && !sessionExpired;

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isEditor,
    isAuthenticated,
    sessionExpired,
    dismissSessionExpired
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
