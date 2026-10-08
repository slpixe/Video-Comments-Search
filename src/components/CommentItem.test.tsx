import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { commentThreadsFixture } from '../mocks/fixtures/commentThreads';
import { MockAuthProvider } from '../mocks/MockAuthProvider';
import { YOUTUBE_API } from '../api/youtube';
import CommentItem from './CommentItem';

function renderComment(index = 0) { render(<MockAuthProvider signedIn><CommentItem item={commentThreadsFixture.items[index]} index={index} accessToken="test-token" /></MockAuthProvider>); }
it('expands replies from the keyboard and caches them', async () => {
  const called = vi.fn();
  server.events.on('request:start', called);
  try {
    renderComment();
    const user = userEvent.setup();
    screen.getByRole('button', { name: 'Show replies' }).focus();
    await user.keyboard(' ');
    expect(await screen.findByText('Great point!')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Hide replies' })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Hide replies' }));
    await user.click(screen.getByRole('button', { name: 'Show replies' }));
    expect(called).toHaveBeenCalledTimes(1);
  } finally { server.events.removeListener('request:start', called); }
});
it('allows retry after reply errors', async () => {
  server.use(http.get(`${YOUTUBE_API}/comments`, () => new HttpResponse('Bad gateway', { status: 502 })));
  renderComment();
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Show replies' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('502');
  server.resetHandlers();
  await user.click(screen.getByRole('button', { name: 'Retry replies' }));
  expect(await screen.findByText('Great point!')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
it('loads additional reply pages without losing earlier replies', async () => {
  const replies = commentThreadsFixture.items[0].replies!.comments;
  server.use(http.get(`${YOUTUBE_API}/comments`, ({ request }) => HttpResponse.json({ items: new URL(request.url).searchParams.has('pageToken') ? [replies[1]] : [replies[0]], nextPageToken: new URL(request.url).searchParams.has('pageToken') ? undefined : 'reply-page-2' })));
  renderComment();
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Show replies' }));
  await screen.findByText('Great point!');
  await user.click(screen.getByRole('button', { name: 'Load more replies' }));
  expect(await screen.findByText('I agree with this!')).toBeVisible();
  expect(screen.getByText('Great point!')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Load more replies' })).not.toBeInTheDocument();
});
it('does not offer replies when there are none', () => {
  renderComment(1);
  expect(screen.queryByRole('button', { name: 'Show replies' })).not.toBeInTheDocument();
});
