import { delay, http, HttpResponse } from 'msw';
import { commentThreadsFixture } from './fixtures/commentThreads';
import { YOUTUBE_API } from '../api/youtube';

export const handlers = [
  http.get(`${YOUTUBE_API}/commentThreads`, async ({ request }) => {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');
    if (!request.headers.get('Authorization')?.startsWith('Bearer ')) {
      return HttpResponse.json({ error: { message: 'Missing access token' } }, { status: 401 });
    }
    if (videoId === 'expired0000') return HttpResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
    if (videoId === 'quota000000') return HttpResponse.json({ error: { errors: [{ reason: 'quotaExceeded' }] } }, { status: 403 });
    if (videoId === 'disabled000') return HttpResponse.json({ error: { errors: [{ reason: 'commentsDisabled' }] } }, { status: 403 });
    if (videoId === 'slow0000000') await delay(2000);
    const query = (url.searchParams.get('searchTerms') ?? '').toLowerCase();
    const pageTwo = Boolean(url.searchParams.get('pageToken'));
    const pageItems = pageTwo ? [{ ...commentThreadsFixture.items[1], id: 'comment4', snippet: {
      totalReplyCount: 0,
      topLevelComment: { id: 'comment4_tl', snippet: { ...commentThreadsFixture.items[1].snippet.topLevelComment.snippet, textOriginal: 'A comment on the next page' } },
    } }] : commentThreadsFixture.items;
    const items = videoId === 'empty000000' ? [] : pageItems.filter(item => item.snippet.topLevelComment.snippet.textOriginal.toLowerCase().includes(query));
    return HttpResponse.json({ ...commentThreadsFixture, items, nextPageToken: !pageTwo && !query && items.length ? 'page-2' : undefined, pageInfo: { totalResults: items.length, resultsPerPage: 30 } });
  }),
  http.get(`${YOUTUBE_API}/comments`, ({ request }) => {
    const url = new URL(request.url);
    const parent = commentThreadsFixture.items.find(item => item.snippet.topLevelComment.id === url.searchParams.get('parentId'));
    const items = parent?.replies?.comments ?? [];
    return HttpResponse.json({ kind: 'youtube#commentListResponse', items, pageInfo: { totalResults: items.length, resultsPerPage: 100 } });
  }),
];
