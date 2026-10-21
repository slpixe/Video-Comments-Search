import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { getFailureReason, listReplies, parseVideoId, searchComments, YOUTUBE_API } from './youtube';

it('classifies a referrer-rejected key separately from a forbidden video', async () => {
  server.use(http.get(`${YOUTUBE_API}/commentThreads`, () => HttpResponse.json({ error: {
    errors: [{ reason: 'forbidden' }], details: [{ reason: 'API_KEY_HTTP_REFERRER_BLOCKED' }],
  } }, { status: 403 })));
  const error = await searchComments('kJQP7kiw5Fk', '').catch(error => error);
  expect(getFailureReason(error)).toBe('api_key');
});

it.each(['kJQP7kiw5Fk', ' https://youtu.be/kJQP7kiw5Fk?t=2 ', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'https://youtube.com/shorts/kJQP7kiw5Fk', 'https://youtube.com/embed/kJQP7kiw5Fk', 'https://youtube.com/live/kJQP7kiw5Fk'])('extracts a video ID from %s', input => {
  expect(parseVideoId(input)).toBe('kJQP7kiw5Fk');
});
it.each(['', 'abc', 'https://youtube.com.evil.test/watch?v=kJQP7kiw5Fk', 'https://example.com/kJQP7kiw5Fk', 'ftp://youtube.com/watch?v=kJQP7kiw5Fk'])('rejects %s', input => expect(parseVideoId(input)).toBeNull());
it('falls back to the HTTP status when the error body is not JSON', async () => {
  server.use(http.get(`${YOUTUBE_API}/commentThreads`, () => new HttpResponse('Unavailable', { status: 503 })));
  await expect(searchComments('kJQP7kiw5Fk', '')).rejects.toMatchObject({ status: 503, message: 'YouTube API error 503. Please try again.' });
});

it('uses the restricted app key for paginated replies without a Google token', async () => {
  let requested: Request | undefined;
  server.use(http.get(`${YOUTUBE_API}/comments`, ({ request }) => {
    requested = request;
    return HttpResponse.json({ items: [] });
  }));
  await listReplies('comment-parent', 'next-replies');
  const params = new URL(requested!.url).searchParams;
  expect(params.get('parentId')).toBe('comment-parent');
  expect(params.get('pageToken')).toBe('next-replies');
  expect(params.get('key')).toBe('mock-youtube-api-key');
  expect(requested!.headers.has('Authorization')).toBe(false);
});
it('reports missing API configuration without sending a request', async () => {
  vi.stubEnv('VITE_YOUTUBE_API_KEY', '');
  const called = vi.fn();
  server.use(http.get(`${YOUTUBE_API}/commentThreads`, called));
  await expect(searchComments('kJQP7kiw5Fk', '')).rejects.toThrow('YouTube search is not configured');
  expect(called).not.toHaveBeenCalled();
});
