import { useState, useEffect, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getDashboard, type UserProfile, type LoginData } from '../services/auth';
import { AuthContext } from './AuthState';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dv_token'));
  const [loading, setLoading] = useState(!!token);  // if token exists, we need to verify

  // On mount: if we have a token, fetch the profile
  useEffect(() => {
    if (token) {
      getDashboard()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('dv_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (data: LoginData) => {
    const res = await apiLogin(data);
    const newToken = res.token;
    localStorage.setItem('dv_token', newToken);
    setToken(newToken);
    const profile = await getDashboard();
    setUser(profile);
  };

  /** Immediate login for flows that already have a token + profile (Google OAuth) */
  const loginWithToken = (newToken: string, profile: UserProfile) => {
    localStorage.setItem('dv_token', newToken);
    setToken(newToken);
    setUser(profile);
  };

  const logout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    localStorage.removeItem('dv_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const profile = await getDashboard();
    setUser(profile);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
