import type { CaptureResult } from 'posthog-js';
import { sanitizeEvent, telemetryConfig } from './telemetry';

const payload = (event: string, properties: Record<string, unknown>): CaptureResult => ({ uuid: 'test-event', event, properties });

it('keeps conversion measures and cookieless ingestion fields without sending private search or identity data', () => {
  vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test_project');
  const result = sanitizeEvent({ ...payload('search_succeeded', {
    distinct_id: '$posthog_cookieless', token: 'youtube-key-must-not-leak',
    $current_url: 'https://video-comment-search.slpixe.com/?video=private-video&query=private-search',
    $referrer: 'https://example.com/?token=secret', $initial_current_url: 'private-url',
    $set: { email: 'private-email' }, $session_id: 'private-session',
    query: 'private-search', videoId: 'private-video', has_query: true, result_count: 30, duration_ms: 123.4,
  }), $set: { email: 'private-email' }, $set_once: { token: 'secret' } });
  expect(result?.properties).toMatchObject({ token: 'phc_test_project', distinct_id: '$posthog_cookieless',
    $cookieless_mode: true, has_query: true, result_count: 30, duration_ms: 123, $current_url: 'https://video-comment-search.slpixe.com/' });
  expect(JSON.stringify(result)).not.toMatch(/private-|secret|youtube-key/);
  vi.unstubAllEnvs();
});

it('removes exception messages, causes, breadcrumbs, source context and URL parameters, retaining only local asset locations', () => {
  const result = sanitizeEvent(payload('$exception', {
    source: 'search', reason: 'api_key', $exception_message: 'private-token',
    $exception_list: [{ type: 'TypeError', value: 'private-token', cause: { message: 'private-query' },
      stacktrace: { frames: [
        { filename: 'https://video-comment-search.slpixe.com/assets/index-123.js?key=private-key#private-hash', lineno: 4, colno: 9, context_line: 'private-comment', function: 'private-function' },
        { filename: 'https://www.googleapis.com/youtube/v3/comments?key=private-key' },
        { filename: 'https://video-comment-search.slpixe.com/private-path.js' },
      ] }, mechanism: { handled: true, data: 'private-data' } }],
  }));
  expect(JSON.stringify(result)).not.toContain('private-');
  expect(result?.properties.$exception_list[0]).toMatchObject({ type: 'TypeError', value: 'Application error: search',
    stacktrace: { frames: [{ filename: 'https://video-comment-search.slpixe.com/assets/index-123.js', lineno: 4, colno: 9 }] } });
});

it('rejects unsolicited events and unknown payload properties', () => {
  expect(sanitizeEvent(payload('$autocapture', { text: 'private-comment' }))).toBeNull();
  expect(sanitizeEvent(payload('$identify', { email: 'private-email' }))).toBeNull();
  expect(sanitizeEvent(null)).toBeNull();
  const result = sanitizeEvent(payload('search_failed', { reason: 'private-message', source: 'private-source', duration_ms: Infinity }));
  expect(result?.properties).not.toHaveProperty('reason');
  expect(result?.properties).not.toHaveProperty('source');
  expect(result?.properties).not.toHaveProperty('duration_ms');
  expect(telemetryConfig).toMatchObject({ cookieless_mode: 'always', person_profiles: 'never', autocapture: false, disable_session_recording: true });
});
