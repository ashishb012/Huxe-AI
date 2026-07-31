// ─────────────────────────────────────────────────────────────
// Huxe AI — Auth Service
// Integrates real Google OAuth via @react-native-google-signin/google-signin
// ─────────────────────────────────────────────────────────────

import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

let isInitialized = false;

export function initGoogleSignIn() {
  if (isInitialized) return;
  if (!WEB_CLIENT_ID) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in environment');
  }
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/calendar.readonly',
    ],
    offlineAccess: true, // required for refresh token
  });
  isInitialized = true;
}

// ── Types ───────────────────────────────────────────────────

export interface GoogleSignInResult {
  user: {
    name: string;
    email: string;
    photoUrl: string;
  };
  accessToken: string | null;
  idToken: string | null;
}

// ── Helpers ─────────────────────────────────────────────────

async function getTokensFromResult(userInfo: any): Promise<GoogleSignInResult> {
  const tokens = await GoogleSignin.getTokens();
  return {
    user: {
      name: userInfo.user.name || 'User',
      email: userInfo.user.email,
      photoUrl: userInfo.user.photo || '',
    },
    accessToken: tokens.accessToken || null,
    idToken: userInfo.idToken || null,
  };
}

// ── Sign In ─────────────────────────────────────────────────

export async function googleSignIn(): Promise<GoogleSignInResult> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  
  const response = await GoogleSignin.signIn();
  
  // v13+ API uses isSuccessResponse, older versions throw or return user directly
  if (isSuccessResponse && isSuccessResponse(response)) {
    return getTokensFromResult(response.data);
  } else if (response && (response as any).user) {
    // Fallback for slightly older v16 return type if it doesn't wrap in `data`
    return getTokensFromResult(response);
  }
  
  throw new Error('Google Sign-In failed or was cancelled');
}

/** Opens Google's account chooser for a secondary, read-only connection. */
export async function googleSignInForAdditionalAccount(): Promise<GoogleSignInResult> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // The native SDK supports one active account. Stored app connections are not removed.
  await GoogleSignin.signOut();
  return googleSignIn();
}

// ── Sign Out ────────────────────────────────────────────────

export async function googleSignOut(): Promise<void> {
  await GoogleSignin.signOut();
}

// ── Silent Sign In / Restore ────────────────────────────────

export async function restoreSession(): Promise<GoogleSignInResult | null> {
  try {
    const hasPreviousSignIn = GoogleSignin.hasPreviousSignIn();
    if (!hasPreviousSignIn) return null;

    const response = await GoogleSignin.signInSilently();
    if (isSuccessResponse && isSuccessResponse(response as any)) {
      return getTokensFromResult(response.data);
    } else if (response && (response as any).user) {
      return getTokensFromResult(response);
    }
    return null;
  } catch (error: any) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_REQUIRED) {
      return null;
    }
    console.warn('Silent sign-in failed:', error);
    return null;
  }
}

// ── Token Refresh ───────────────────────────────────────────

export async function getFreshAccessToken(): Promise<string> {
  const tokens = await GoogleSignin.getTokens();
  return tokens.accessToken;
}
