import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getMe, postLogin, postRegister, postVerifyEmail } from '@/lib/auth-client';
import { clearStoredToken, getStoredToken, setStoredToken } from '@/lib/auth-storage';

type AuthContextValue = {
  token: string | null;
  user: unknown | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ id: number; email: string }>;
  verifyEmail: (email: string, otp: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await getStoredToken();
        if (!cancelled) setToken(stored);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const { user: u } = await getMe(token);
      setUser(u);
    } catch {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      setUser(null);
      return;
    }
    void refreshUser();
  }, [ready, token, refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token: jwt } = await postLogin(email, password);
    await setStoredToken(jwt);
    setToken(jwt);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    return postRegister(email, password);
  }, []);

  const verifyEmail = useCallback(async (email: string, otp: string, password: string) => {
    const { token: jwt } = await postVerifyEmail(email, otp, password);
    await setStoredToken(jwt);
    setToken(jwt);
  }, []);

  const signOut = useCallback(async () => {
    await clearStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      ready,
      signIn,
      signUp,
      verifyEmail,
      signOut,
      refreshUser,
    }),
    [token, user, ready, signIn, signUp, verifyEmail, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
