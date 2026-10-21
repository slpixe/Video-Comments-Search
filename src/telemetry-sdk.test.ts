import { PostHog } from 'posthog-js';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { telemetryConfig } from './telemetry';

it('keeps real SDK events ingestible and sanitizes the real exception format', () => {
  server.use(http.all(/https:\/\/.*posthog\.com\//, () => HttpResponse.json({ status: 1 })));
  vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_project');
  const sdk = new PostHog();
  sdk.init('phc_test_project', { ...telemetryConfig, api_host: 'https://eu.i.posthog.com',
    request_batching: false, disable_compression: true });
  const event = sdk.capture('search_succeeded', { result_count: 30, has_query: true, duration_ms: 80 });
  expect(event?.properties).toMatchObject({ distinct_id: '$posthog_cookieless', token: 'phc_test_project', $cookieless_mode: true, result_count: 30 });
  const error = new TypeError('private-search-text');
  error.stack = 'TypeError: private-search-text\n    at search (https://video-comment-search.slpixe.com/assets/index-123.js?key=private-key:4:9)';
  const exception = sdk.captureException(error, { source: 'search', reason: 'network' });
  expect(exception?.event).toBe('$exception');
  expect(exception?.properties.$exception_list[0]).toMatchObject({ type: 'TypeError', value: 'Application error: search',
    stacktrace: { frames: [{ filename: 'https://video-comment-search.slpixe.com/assets/index-123.js', lineno: 4, colno: 9 }] } });
  expect(JSON.stringify(exception)).not.toContain('private-');
  expect(document.cookie).not.toContain('ph_');
  expect(Object.keys(localStorage).filter(key => key.startsWith('ph_'))).toEqual([]);
  expect(Object.keys(sessionStorage).filter(key => key.startsWith('ph_'))).toEqual([]);
  vi.unstubAllEnvs();
});
