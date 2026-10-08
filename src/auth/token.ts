export const TOKEN_STORAGE_KEY = 'yt_oauth';
export const TOKEN_SCOPE_VERSION = 'v3';
export interface StoredToken {
  accessToken: string;
  expiresAt: number;
  scopeVersion: string;
}

export function clearStoredToken(): void {
  try { sessionStorage.removeItem(TOKEN_STORAGE_KEY); } catch { /* Storage may be disabled. */ }
}

export function getStoredToken(now = Date.now()): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredToken> | null;
    if (!stored || typeof stored.accessToken !== 'string' || !stored.accessToken ||
        typeof stored.expiresAt !== 'number' || !Number.isFinite(stored.expiresAt) ||
        stored.expiresAt <= now || stored.scopeVersion !== TOKEN_SCOPE_VERSION) {
      clearStoredToken();
      return null;
    }
    return stored as StoredToken;
  } catch {
    clearStoredToken();
    return null;
  }
}

export function storeToken(accessToken: string, expiresIn: number): StoredToken {
  const token = { accessToken, expiresAt: Date.now() + expiresIn * 1000, scopeVersion: TOKEN_SCOPE_VERSION };
  try { sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token)); } catch { /* Keep the session in memory. */ }
  return token;
}
