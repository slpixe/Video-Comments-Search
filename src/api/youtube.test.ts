import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { parseVideoId, searchComments, YOUTUBE_API } from './youtube';

it.each(['kJQP7kiw5Fk', ' https://youtu.be/kJQP7kiw5Fk?t=2 ', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'https://youtube.com/shorts/kJQP7kiw5Fk', 'https://youtube.com/embed/kJQP7kiw5Fk', 'https://youtube.com/live/kJQP7kiw5Fk'])('extracts a video ID from %s', input => {
  expect(parseVideoId(input)).toBe('kJQP7kiw5Fk');
});
it.each(['', 'abc', 'https://youtube.com.evil.test/watch?v=kJQP7kiw5Fk', 'https://example.com/kJQP7kiw5Fk', 'ftp://youtube.com/watch?v=kJQP7kiw5Fk'])('rejects %s', input => expect(parseVideoId(input)).toBeNull());
it('falls back to the HTTP status when the error body is not JSON', async () => {
  server.use(http.get(`${YOUTUBE_API}/commentThreads`, () => new HttpResponse('Unavailable', { status: 503 })));
  await expect(searchComments('kJQP7kiw5Fk', '', 'test-token')).rejects.toMatchObject({ status: 503, message: 'YouTube API error 503. Please try again.' });
});
