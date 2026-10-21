import type { CommentThreadsResponse, CommentsListResponse } from '../types/youtube';
import type { FailureReason } from '../telemetry';
export const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
const messages: Record<string, string> = {
  quotaExceeded: 'YouTube API quota exceeded. Please try again later.',
  forbidden: "Access to this video's comments is forbidden.",
  commentsDisabled: 'Comments are disabled for this video.',
  videoNotFound: 'This video could not be found.',
  keyInvalid: 'The YouTube API key was rejected. Contact the app owner.',
  accessNotConfigured: 'The YouTube Data API is not enabled for this app. Contact the app owner.',
};
export class YouTubeApiError extends Error {
  constructor(message: string, public status: number, public reason: FailureReason = 'unknown') { super(message); }
}
const failureReasons: Record<string, FailureReason> = {
  quotaExceeded: 'quota', dailyLimitExceeded: 'quota', keyInvalid: 'api_key',
  accessNotConfigured: 'api_disabled', commentsDisabled: 'comments_disabled',
  videoNotFound: 'not_found', commentNotFound: 'not_found', forbidden: 'forbidden',
  API_KEY_HTTP_REFERRER_BLOCKED: 'api_key', API_KEY_SERVICE_BLOCKED: 'api_key',
  API_KEY_INVALID: 'api_key', API_KEY_EXPIRED: 'api_key', SERVICE_DISABLED: 'api_disabled',
};
export function getFailureReason(error: unknown): FailureReason {
  if (error instanceof YouTubeApiError) return error.reason;
  return error instanceof TypeError ? 'network' : 'unknown';
}
async function request<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!key || key === 'your-restricted-youtube-api-key') {
    throw new YouTubeApiError('YouTube search is not configured. Contact the app owner.', 0, 'api_key');
  }
  const response = await fetch(`${YOUTUBE_API}/${path}?${new URLSearchParams({ ...params, key })}`, { signal });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string; errors?: { reason?: string }[]; details?: { reason?: string }[] } } | null;
    const reason = body?.error?.errors?.[0]?.reason;
    const detailReason = body?.error?.details?.find(detail => detail.reason && failureReasons[detail.reason])?.reason;
    throw new YouTubeApiError(response.status === 401 ? messages.keyInvalid
      : (reason && messages[reason]) || body?.error?.message || `YouTube API error ${response.status}. Please try again.`, response.status,
      response.status === 401 ? 'api_key' : (detailReason && failureReasons[detailReason]) || (reason && failureReasons[reason]) || (response.status >= 500 ? 'server' : 'unknown'));
  }
  return response.json() as Promise<T>;
}
export function searchComments(videoId: string, query: string, pageToken?: string, signal?: AbortSignal) {
  return request<CommentThreadsResponse>('commentThreads', {
    part: 'snippet', videoId, maxResults: '30', ...(query ? { searchTerms: query } : {}), ...(pageToken ? { pageToken } : {}),
  }, signal);
}
export function listReplies(parentId: string, pageToken?: string, signal?: AbortSignal) {
  return request<CommentsListResponse>('comments', {
    part: 'snippet', parentId, maxResults: '100', ...(pageToken ? { pageToken } : {}),
  }, signal);
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
