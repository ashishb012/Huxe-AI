// ─────────────────────────────────────────────────────────────
// Huxe AI — Auth Service (Phase 1: Mock Implementation)
// Phase 2 will integrate real Google OAuth via
// @react-native-google-signin/google-signin
// ─────────────────────────────────────────────────────────────

// ── Types ───────────────────────────────────────────────────

export interface GoogleSignInResult {
  user: {
    name: string;
    email: string;
    photoUrl: string;
  };
  accessToken: string;
  refreshToken: string;
}

// ── Sign In ─────────────────────────────────────────────────

/**
 * Initiate Google sign-in.
 *
 * Phase 2 roadmap:
 * - Configure GoogleSignin with webClientId
 * - Request scopes: gmail.readonly, calendar.readonly
 * - Store tokens securely via react-native-keychain
 */
export async function googleSignIn(): Promise<GoogleSignInResult> {
  return {
    user: {
      name: 'Ashish',
      email: 'ashish@gmail.com',
      photoUrl: '',
    },
    accessToken: 'dummy_access_token',
    refreshToken: 'dummy_refresh_token',
  };
}

// ── Sign Out ────────────────────────────────────────────────

/**
 * Sign out and revoke tokens.
 *
 * Phase 2 roadmap:
 * - Call GoogleSignin.signOut()
 * - Clear keychain credentials
 */
export async function googleSignOut(): Promise<void> {
  // Phase 2: Real sign-out + keychain cleanup
}

// ── Token Refresh ───────────────────────────────────────────

/**
 * Refresh an expired access token using the stored refresh token.
 *
 * Phase 2 roadmap:
 * - POST to Google OAuth2 token endpoint
 * - Update keychain with new access token
 * - Wire into an Axios/fetch interceptor for automatic refresh
 *
 * @param _refreshToken The refresh token to use (unused in Phase 1)
 * @returns A new access token string
 */
export async function refreshAccessToken(
  _refreshToken: string,
): Promise<string> {
  return 'dummy_refreshed_token';
}
