import React, { createContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('fincorp_auth_token') || '');
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    async function checkAuth() {
      const savedToken = localStorage.getItem('fincorp_auth_token');
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.validateSession();
        if (res.success && res.data && res.data.user) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data) {
        setUser(res.data.user);
        setToken(res.data.token);
        if (rememberMe) {
          localStorage.setItem('fincorp_auth_token', res.data.token);
          localStorage.setItem('fincorp_user', JSON.stringify(res.data.user));
        } else {
          sessionStorage.setItem('fincorp_auth_token', res.data.token);
        }
        return { success: true };
      }
      return { success: false, message: res.message || 'Login gagal.' };
    } catch (err) {
      return { success: false, message: 'Gagal menghubungi server API.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('fincorp_auth_token');
    localStorage.removeItem('fincorp_user');
    sessionStorage.removeItem('fincorp_auth_token');
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
