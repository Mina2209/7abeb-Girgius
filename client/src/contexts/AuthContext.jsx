import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

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

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { token: newToken, user: newUser } = response;
      
      setToken(newToken);
      setUser(newUser);
      
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isEditor = () => user?.role === 'EDITOR' || user?.role === 'ADMIN';
  const isAuthenticated = () => !!token && !!user;

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isEditor,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
