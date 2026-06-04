// ─────────────────────────────────────────────────────────────
// Huxe AI — Auth Context
// Integrates @react-native-google-signin/google-signin
// ─────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { googleSignIn, googleSignOut, restoreSession, initGoogleSignIn } from '../services/authService';

// ── Types ───────────────────────────────────────────────────

export interface AuthUser {
  name: string;
  email: string;
  photoUrl: string;
}

interface AuthContextValue {
  /** Whether the user has been authenticated */
  isAuthenticated: boolean;

  /** True while initial auth state is being restored */
  isLoading: boolean;

  /** The signed-in user, or null */
  user: AuthUser | null;

  /** Trigger sign-in flow */
  signIn: () => Promise<void>;

  /** Sign out and clear user state */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        initGoogleSignIn();
        const result = await restoreSession();
        if (result) {
          setUser(result.user);
        }
      } catch (error) {
        console.warn('[AuthProvider] Restore session failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const signIn = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await googleSignIn();
      setUser(result.user);
    } catch (error) {
      console.error('[AuthProvider] Sign-in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await googleSignOut();
      setUser(null);
    } catch (error) {
      console.error('[AuthProvider] Sign-out failed:', error);
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isLoading,
      user,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
