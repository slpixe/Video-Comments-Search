import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { GoogleOAuthProvider, googleLogout, useGoogleLogin } from '@react-oauth/google';
import { clearStoredToken, getStoredToken, storeToken } from './token';

export interface AuthSession {
  accessToken: string | null;
  error: string | null;
  login: () => void;
  logout: () => void;
  expire: () => void;
  loginAvailable: boolean;
}
export const AuthContext = createContext<AuthSession | null>(null);
export function useAuth(): AuthSession {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('Search must be rendered inside an AuthProvider');
  return auth;
}

function GoogleSession({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getStoredToken);
  const [error, setError] = useState<string | null>(null);
  const expire = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setError('Your Google session expired. Please log in again.');
  }, []);
  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(expire, Math.max(0, token.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [token, expire]);
  const googleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    onSuccess: (response) => {
      setToken(storeToken(response.access_token, response.expires_in));
      setError(null);
    },
    onError: () => setError('Google could not sign you in. Please try again. If access is blocked, contact the app owner.'),
    onNonOAuthError: (failure) => setError(failure.type === 'popup_failed_to_open'
      ? 'The login popup was blocked. Allow popups for this site and try again.'
      : 'Google login was closed before it finished. Please try again.'),
  });
  return <AuthContext.Provider value={{
    accessToken: token?.accessToken ?? null, error, expire, loginAvailable: true,
    login: () => { setError(null); googleLogin(); },
    logout: () => { googleLogout(); clearStoredToken(); setToken(null); setError(null); },
  }}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children, clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID }: { children: ReactNode; clientId?: string }) {
  if (!clientId || clientId === 'your-client-id.apps.googleusercontent.com') {
    return <AuthContext.Provider value={{ accessToken: null, error: 'Google login is not configured. Set VITE_GOOGLE_CLIENT_ID and rebuild the app.', loginAvailable: false, login: () => {}, logout: () => {}, expire: () => {} }}>{children}</AuthContext.Provider>;
  }
  return <GoogleOAuthProvider clientId={clientId}><GoogleSession>{children}</GoogleSession></GoogleOAuthProvider>;
}
