import { createContext, useContext, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function loadUser() {
  try {
    const raw = localStorage.getItem('oliveflow_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);
  const [loading, setLoading] = useState(false);

  async function login(email, password) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (!data.success) throw new Error(data.message || 'Login failed');
      localStorage.setItem('oliveflow_access', data.data.accessToken);
      localStorage.setItem('oliveflow_refresh', data.data.refreshToken);
      localStorage.setItem('oliveflow_user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return data.data.user;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('oliveflow_access');
    localStorage.removeItem('oliveflow_refresh');
    localStorage.removeItem('oliveflow_user');
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
