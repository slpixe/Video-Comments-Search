import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { MockAuthProvider } from './mocks/MockAuthProvider';
import { YOUTUBE_API } from './api/youtube';
import VideoCommentsSearch from './VideoCommentsSearch';

function renderSearch(signedIn = true) {
  return render(<MockAuthProvider signedIn={signedIn}><VideoCommentsSearch /></MockAuthProvider>);
}
async function search(id = 'kJQP7kiw5Fk') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/youtube video id/i), id);
  await user.click(screen.getByRole('button', { name: 'Search' }));
  return user;
}

describe('VideoCommentsSearch', () => {
  it('requires login, then allows search and clears results on logout', async () => {
    const user = userEvent.setup();
    renderSearch(false);
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Login with Google' }));
    await search();
    expect(await screen.findByText('This is the first comment')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(screen.queryByText('This is the first comment')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
  });
  it('accepts links, sends the search term and app key without a Google token, and preserves other URL parameters', async () => {
    window.history.replaceState({}, '', '/?keep=yes#anchor');
    let requested: Request | undefined;
    server.use(http.get(`${YOUTUBE_API}/commentThreads`, ({ request }) => {
      requested = request;
      return HttpResponse.json({ items: [] });
    }));
    renderSearch();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Search term'), ' song ');
    await search('https://youtu.be/kJQP7kiw5Fk?t=10');
    await screen.findByText('No results found');
    expect(new URL(requested!.url).searchParams.get('videoId')).toBe('kJQP7kiw5Fk');
    expect(new URL(requested!.url).searchParams.get('searchTerms')).toBe('song');
    expect(new URL(requested!.url).searchParams.get('key')).toBe('mock-youtube-api-key');
    expect(requested!.headers.has('Authorization')).toBe(false);
    expect(window.location.search).toContain('keep=yes');
    expect(window.location.hash).toBe('#anchor');
  });
  it('appends subsequent pages and hides the button on the final page', async () => {
    renderSearch();
    const user = await search();
    await screen.findByText('This is the first comment');
    await user.click(screen.getByRole('button', { name: 'Load more comments' }));
    expect(await screen.findByText('A comment on the next page')).toBeInTheDocument();
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('4 comments loaded');
    expect(screen.queryByRole('button', { name: 'Load more comments' })).not.toBeInTheDocument();
  });
  it('copies the submitted video and query and links back to the selected video', async () => {
    renderSearch();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Search term'), 'great');
    await search('https://youtu.be/kJQP7kiw5Fk');
    await screen.findByText('Another great video!');
    const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    await user.click(screen.getByRole('button', { name: 'Copy search link' }));
    expect(write).toHaveBeenCalledWith(window.location.href);
    expect(window.location.search).toContain('video=kJQP7kiw5Fk&query=great');
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open on YouTube' })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk');
    await user.type(screen.getByLabelText('Search term'), 'new');
    expect(screen.queryByRole('button', { name: 'Copy search link' })).not.toBeInTheDocument();
  });
  it('offers a selectable link when clipboard access is blocked', async () => {
    renderSearch();
    const user = await search();
    await screen.findByText('This is the first comment');
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Blocked'));
    await user.click(screen.getByRole('button', { name: 'Copy search link' }));
    const link = await screen.findByLabelText('Copy this search link');
    expect(link).toHaveValue(window.location.href);
    await user.click(link);
    expect((link as HTMLInputElement).selectionStart).toBe(0);
    expect((link as HTMLInputElement).selectionEnd).toBe(window.location.href.length);
  });
  it.each([
    ['empty000000', 'No results found'],
    ['quota000000', 'YouTube API quota exceeded. Please try again later.'],
    ['disabled000', 'Comments are disabled for this video.'],
  ])('handles %s', async (videoId, message) => {
    renderSearch();
    await search(videoId);
    expect(await screen.findByText(message)).toBeInTheDocument();
  });
  it('keeps Google login when the independent API key is rejected', async () => {
    renderSearch();
    await search('keybad00000');
    expect(await screen.findByRole('alert')).toHaveTextContent('API key was rejected');
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled();
  });
  it('rejects invalid IDs without making an API request', async () => {
    const called = vi.fn();
    server.use(http.get(`${YOUTUBE_API}/commentThreads`, called));
    renderSearch();
    await search('invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('valid YouTube');
    expect(called).not.toHaveBeenCalled();
  });
  it('ignores a pending response after input changes', async () => {
    let finish!: () => void;
    const pending = new Promise<void>(resolve => { finish = resolve; });
    server.use(http.get(`${YOUTUBE_API}/commentThreads`, async () => { await pending; return HttpResponse.json({ items: [], nextPageToken: 'stale' }); }));
    renderSearch();
    const user = await search();
    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
    await user.type(screen.getByLabelText('Search term'), 'new');
    await act(async () => { finish(); await pending; });
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more comments' })).not.toBeInTheDocument();
  });
  it('restores inputs and clears old results on browser navigation', async () => {
    renderSearch();
    await search();
    await screen.findByText('This is the first comment');
    act(() => { window.history.replaceState({}, '', '/?video=empty000000&query=song'); fireEvent.popState(window); });
    expect(screen.getByLabelText('Search term')).toHaveValue('song');
    expect(screen.queryByText('This is the first comment')).not.toBeInTheDocument();
  });
  it('retains results when a later page fails and allows retry', async () => {
    renderSearch();
    const user = await search();
    await screen.findByText('This is the first comment');
    server.use(http.get(`${YOUTUBE_API}/commentThreads`, async () => { await delay(10); return new HttpResponse('Bad gateway', { status: 502 }); }));
    await user.click(screen.getByRole('button', { name: 'Load more comments' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('502');
    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Load more comments' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(await screen.findByText('A comment on the next page')).toBeInTheDocument();
  });
});
