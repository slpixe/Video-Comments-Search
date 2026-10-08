import { useState, type ReactNode } from 'react';
import { AuthContext } from '../auth/AuthProvider';

// Only loaded by the explicit development mock mode, tests, and Storybook.
export function MockAuthProvider({ children, signedIn = false }: { children: ReactNode; signedIn?: boolean }) {
  const [accessToken, setAccessToken] = useState<string | null>(signedIn ? 'mock-access-token' : null);
  const [error, setError] = useState<string | null>(null);
  return <AuthContext.Provider value={{
    accessToken, error, loginAvailable: true,
    login: () => { setAccessToken('mock-access-token'); setError(null); },
    logout: () => { setAccessToken(null); setError(null); },
    expire: () => { setAccessToken(null); setError('Your Google session expired. Please log in again.'); },
  }}>{children}</AuthContext.Provider>;
}
