import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type DriverProfileMe,
  fetchDriverMe,
  logoutDriver,
} from '../api/client';

type AuthContextValue = {
  token: string | null;
  refreshToken: string | null;
  driver: DriverProfileMe | null;
  setToken: (t: string | null, refresh?: string | null) => void;
  refreshProfile: () => Promise<DriverProfileMe | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [driver, setDriver] = useState<DriverProfileMe | null>(null);

  const setToken = useCallback((t: string | null, refresh?: string | null) => {
    setTokenState(t);
    if (refresh !== undefined) {
      setRefreshToken(refresh);
    }
    if (!t) {
      setDriver(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setDriver(null);
      return null;
    }
    try {
      const me = await fetchDriverMe(token);
      setDriver(me);
      return me;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      void refreshProfile();
    } else {
      setDriver(null);
    }
  }, [token, refreshProfile]);

  const logout = useCallback(() => {
    if (token) {
      void logoutDriver(token, refreshToken);
    }
    setTokenState(null);
    setRefreshToken(null);
    setDriver(null);
  }, [token, refreshToken]);

  const value = useMemo(
    () => ({
      token,
      refreshToken,
      driver,
      setToken,
      refreshProfile,
      logout,
    }),
    [token, refreshToken, driver, setToken, refreshProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
