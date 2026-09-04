import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('memora_token'));
  const [loading, setLoading] = useState(true);

  // Verify stored session on load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('memora_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('memora_user', JSON.stringify(res.data.user));
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session validation error:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data?.success && res.data?.token) {
      const jwtToken = res.data.token;
      const userData = res.data.user;
      localStorage.setItem('memora_token', jwtToken);
      localStorage.setItem('memora_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const signup = async (formData) => {
    const res = await api.post('/auth/signup', formData);
    return res.data;
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('memora_token');
      localStorage.removeItem('memora_user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
    localStorage.setItem('memora_user', JSON.stringify({ ...user, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        signup,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
