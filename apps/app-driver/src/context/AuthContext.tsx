import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { loginDriver } from '../api/client';

type AuthContextValue = {
  token: string | null;
  phone: string;
  setPhone: (p: string) => void;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [phone, setPhone] = useState('0900000001');

  const login = useCallback(async (p: string, password: string) => {
    const data = await loginDriver(p, password);
    setToken(data.access_token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      phone,
      setPhone,
      login,
      logout,
    }),
    [token, phone, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
