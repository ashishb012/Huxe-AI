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

import {
  googleSignIn,
  googleSignInForAdditionalAccount,
  googleSignOut,
  restoreSession,
  initGoogleSignIn,
} from '../services/authService';
import {
  addConnectedGoogleAccount,
  clearConnectedGoogleAccounts,
  getConnectedGoogleAccounts,
  removeConnectedGoogleAccount,
  savePrimaryGoogleAccount,
  updateConnectedGoogleAccountToken,
  type ConnectedGoogleAccount,
} from '../services/connectedAccountsService';

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
  connectedAccounts: ConnectedGoogleAccount[];

  /** Trigger sign-in flow */
  signIn: () => Promise<void>;

  /** Sign out and clear user state */
  signOut: () => Promise<void>;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedGoogleAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        initGoogleSignIn();
        const savedAccounts = await getConnectedGoogleAccounts();
        const primaryAccount = savedAccounts.find(account => account.isPrimary);
        const result = await restoreSession();
        if (primaryAccount) {
          // GoogleSignin retains the most recently linked account, but the
          // user's original login remains the app's primary identity.
          setUser(primaryAccount);
          setConnectedAccounts(result
            ? await updateConnectedGoogleAccountToken(result.user.email, result.accessToken)
            : savedAccounts);
        } else if (result) {
          setUser(result.user);
          setConnectedAccounts(await savePrimaryGoogleAccount(result.user, result.accessToken));
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
      setConnectedAccounts(await savePrimaryGoogleAccount(result.user, result.accessToken));
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
      await clearConnectedGoogleAccounts();
      setUser(null);
      setConnectedAccounts([]);
    } catch (error) {
      console.error('[AuthProvider] Sign-out failed:', error);
      throw error;
    }
  }, []);

  const linkGoogleAccount = useCallback(async () => {
    const result = await googleSignInForAdditionalAccount();
    setConnectedAccounts(await addConnectedGoogleAccount(result.user, result.accessToken));
  }, []);

  const unlinkGoogleAccount = useCallback(async (email: string) => {
    setConnectedAccounts(await removeConnectedGoogleAccount(email));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isLoading,
      user,
      connectedAccounts,
      signIn,
      signOut,
      linkGoogleAccount,
      unlinkGoogleAccount,
    }),
    [user, connectedAccounts, isLoading, signIn, signOut, linkGoogleAccount, unlinkGoogleAccount],
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
