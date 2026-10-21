// @vitest-environment-options {"url":"https://video-comment-search.slpixe.com/"}
const sdk = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn(), captureException: vi.fn() }));
vi.mock('posthog-js', () => ({ default: sdk }));

beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); });
afterEach(() => vi.unstubAllEnvs());

it('does not load or send telemetry in development or with incomplete production configuration', async () => {
  vi.stubEnv('PROD', false);
  vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
  vi.stubEnv('VITE_POSTHOG_HOST', 'https://eu.i.posthog.com');
  const telemetry = await import('./telemetry');
  telemetry.initializeTelemetry();
  telemetry.trackEvent('login_started');
  expect(sdk.init).not.toHaveBeenCalled();
  expect(sdk.capture).not.toHaveBeenCalled();
  vi.stubEnv('PROD', true);
  vi.stubEnv('VITE_POSTHOG_HOST', '');
  telemetry.initializeTelemetry();
  expect(sdk.init).not.toHaveBeenCalled();
});

it('queues early conversion events, sends pageview first, and reports runtime failures without blocking the app', async () => {
  vi.stubEnv('PROD', true);
  vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test');
  vi.stubEnv('VITE_POSTHOG_HOST', 'https://eu.i.posthog.com');
  const listeners = vi.spyOn(window, 'addEventListener');
  const telemetry = await import('./telemetry');
  telemetry.initializeTelemetry();
  telemetry.initializeTelemetry();
  telemetry.trackEvent('login_started');
  await vi.waitFor(() => expect(sdk.capture).toHaveBeenCalledTimes(2));
  expect(sdk.init).toHaveBeenCalledTimes(1);
  expect(sdk.capture.mock.calls.map(call => call[0])).toEqual(['$pageview', 'login_started']);
  const callback = listeners.mock.calls.find(call => call[0] === 'unhandledrejection')?.[1] as EventListener;
  const failure = new TypeError('network failed');
  callback(Object.assign(new Event('unhandledrejection'), { reason: failure }));
  expect(sdk.captureException).toHaveBeenCalledWith(failure, { source: 'runtime', reason: undefined });
  sdk.capture.mockImplementationOnce(() => { throw new Error('Analytics unavailable'); });
  expect(() => telemetry.trackEvent('login_succeeded')).not.toThrow();
  for (const [name, handler] of listeners.mock.calls) {
    if (name === 'error' || name === 'unhandledrejection') window.removeEventListener(name, handler);
  }
});
