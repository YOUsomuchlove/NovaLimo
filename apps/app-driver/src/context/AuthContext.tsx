import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type AuthContextValue = {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback(() => setToken(null), []);

  const value = useMemo(
    () => ({
      token,
      setToken,
      logout,
    }),
    [token, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}
