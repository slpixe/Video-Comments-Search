import type { CommentThreadsResponse, CommentsListResponse } from '../types/youtube';
export const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
const messages: Record<string, string> = {
  quotaExceeded: 'YouTube API quota exceeded. Please try again later.',
  forbidden: "Access to this video's comments is forbidden.",
  commentsDisabled: 'Comments are disabled for this video.',
  videoNotFound: 'This video could not be found.',
  accessNotConfigured: 'The YouTube Data API is not enabled for this app. Contact the app owner.',
};
export class YouTubeApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
async function request<T>(path: string, params: Record<string, string>, accessToken: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${YOUTUBE_API}/${path}?${new URLSearchParams(params)}`, {
    headers: { Authorization: `Bearer ${accessToken}` }, signal,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string; errors?: { reason?: string }[] } } | null;
    const reason = body?.error?.errors?.[0]?.reason;
    throw new YouTubeApiError(response.status === 401 ? 'Your Google session expired. Please log in again.'
      : (reason && messages[reason]) || body?.error?.message || `YouTube API error ${response.status}. Please try again.`, response.status);
  }
  return response.json() as Promise<T>;
}
export function searchComments(videoId: string, query: string, accessToken: string, pageToken?: string, signal?: AbortSignal) {
  return request<CommentThreadsResponse>('commentThreads', {
    part: 'snippet', videoId, maxResults: '30', ...(query ? { searchTerms: query } : {}), ...(pageToken ? { pageToken } : {}),
  }, accessToken, signal);
}
export function listReplies(parentId: string, accessToken: string, pageToken?: string, signal?: AbortSignal) {
  return request<CommentsListResponse>('comments', {
    part: 'snippet', parentId, maxResults: '100', ...(pageToken ? { pageToken } : {}),
  }, accessToken, signal);
}

export function parseVideoId(input: string): string | null {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    let id: string | null = null;
    if (url.hostname === 'youtu.be') id = url.pathname.split('/')[1];
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(url.hostname)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v')
        : /^\/(shorts|embed|live)\//.test(url.pathname) ? url.pathname.split('/')[2] : null;
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
