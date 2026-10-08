import { test, expect } from '@playwright/test';
const cases = [
  ['search-app--logged-out', 'Please log in with Google to search comments.'],
  ['search-app--ready', 'Enter a video and search its comments.'],
  ['search-app--results', 'This is the first comment'],
  ['search-app--empty', 'No results found'],
  ['search-app--quota-error', 'YouTube API quota exceeded. Please try again later.'],
  ['search-app--expired-session', 'Your Google session expired. Please log in again.'],
  ['search-comment--expanded', 'Great point!'],
  ['search-comment--reply-error', 'YouTube API error 502. Please try again.'],
];
for (const [storyId, text] of cases) {
  test(storyId, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const expectedStatus: Record<string, number> = { 'search-app--quota-error': 403, 'search-app--expired-session': 401, 'search-comment--reply-error': 502 };
    page.on('console', message => {
      if (message.type() !== 'error') return;
      // Chromium also logs the HTTP failures that these stories deliberately simulate.
      if (expectedStatus[storyId] && message.text().startsWith(`Failed to load resource: the server responded with a status of ${expectedStatus[storyId]} (`)) return;
      errors.push(message.text());
    });
    await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
    await expect(page.getByText(text)).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test('loading state', async ({ page }) => {
  await page.goto('/iframe.html?id=search-app--loading&viewMode=story');
  await expect(page.getByRole('progressbar', { name: 'Loading comments' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeDisabled();
});
