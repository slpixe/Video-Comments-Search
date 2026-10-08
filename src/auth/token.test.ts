import { clearStoredToken, getStoredToken, storeToken, TOKEN_STORAGE_KEY } from './token';

describe('session tokens', () => {
  it('restores a valid token and removes it at expiry', () => {
    const token = storeToken('test-token', 3600);
    expect(getStoredToken(token.expiresAt - 1)).toEqual(token);
    expect(getStoredToken(token.expiresAt)).toBeNull();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
  it.each(['null', '{}', '{', JSON.stringify({ accessToken: 'test', expiresAt: Date.now() + 10000, scopeVersion: 'old' }), JSON.stringify({ accessToken: 'test', expiresAt: 'tomorrow', scopeVersion: 'v3' })])('discards malformed or obsolete data: %s', raw => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, raw);
    expect(getStoredToken()).toBeNull();
    expect(sessionStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
  it('supports browsers that deny session storage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    expect(storeToken('test-token', 3600).accessToken).toBe('test-token');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    expect(getStoredToken()).toBeNull();
    expect(() => clearStoredToken()).not.toThrow();
  });
});
