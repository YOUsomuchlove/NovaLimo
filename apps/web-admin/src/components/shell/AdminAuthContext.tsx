'use client';

import type { Me, Permission } from '@limousine-workspace/shared-types';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  adminApi,
  clearAdminToken,
  getAdminToken,
  logoutAdmin,
} from '../../lib/api';
import { disconnectAdminSocket } from '../../lib/socket';

interface AdminAuthContextValue {
  user: Me | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (perm?: Permission) => boolean;
  refreshUser: () => Promise<Me | null>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  hasPermission: () => true,
  refreshUser: async () => null,
  signOut: async () => undefined,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<Me | null> => {
    const token = getAdminToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const me = await adminApi.me();
      setUser(me);
      return me;
    } catch {
      clearAdminToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    disconnectAdminSocket();
    await logoutAdmin();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (perm?: Permission) => {
      if (!perm) return true;
      // When user is loaded, check permissions; super-admin role ('admin') or explicit permission grants access.
      if (!user) return true;
      if (
        user.roles.some((r) => r.slug === 'superadmin' || r.slug === 'admin')
      ) {
        return true;
      }
      return user.permissions.includes(perm);
    },
    [user],
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      hasPermission,
      refreshUser,
      signOut,
    }),
    [user, loading, hasPermission, refreshUser, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  return useContext(AdminAuthContext);
}
