import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthProvider';
import { storeToken, TOKEN_STORAGE_KEY } from './token';

const google = vi.hoisted(() => ({ options: {} as { onSuccess: (response: { access_token: string; expires_in: number }) => void; onError: () => void; onNonOAuthError: (failure: { type: string }) => void }, login: vi.fn(), logout: vi.fn() }));
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
  useGoogleLogin: (options: typeof google.options) => { google.options = options; return google.login; },
  googleLogout: google.logout,
}));
function SessionView() {
  const session = useAuth();
  return <><span>{session.accessToken ? 'Signed in' : 'Signed out'}</span>{session.error && <p role="alert">{session.error}</p>}<button disabled={!session.loginAvailable} onClick={session.login}>Login</button><button onClick={session.logout}>Logout</button></>;
}
function renderSession(clientId = 'test-client') { render(<AuthProvider clientId={clientId}><SessionView /></AuthProvider>); }
it('reports missing configuration without attempting login', () => {
  renderSession('');
  expect(screen.getByRole('alert')).toHaveTextContent('not configured');
  expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled();
});
it('stores a successful login and clears it on logout', async () => {
  renderSession();
  act(() => google.options.onSuccess({ access_token: 'test-token', expires_in: 3600 }));
  expect(screen.getByText('Signed in')).toBeInTheDocument();
  expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toContain('test-token');
  await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
  expect(screen.getByText('Signed out')).toBeInTheDocument();
  expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
});
it('expires an open session when its token lifetime ends', () => {
  vi.useFakeTimers();
  try {
    storeToken('test-token', 1);
    renderSession();
    expect(screen.getByText('Signed in')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('session expired');
  } finally { vi.useRealTimers(); }
});
it.each(['popup_failed_to_open', 'popup_closed'])('explains %s and clears the error on retry', async type => {
  renderSession();
  act(() => google.options.onNonOAuthError({ type }));
  expect(screen.getByRole('alert')).toHaveTextContent(type === 'popup_closed' ? 'closed' : 'blocked');
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(google.login).toHaveBeenCalled();
});
it('surfaces OAuth rejection', () => {
  renderSession();
  act(() => google.options.onError());
  expect(screen.getByRole('alert')).toHaveTextContent('could not sign you in');
});
