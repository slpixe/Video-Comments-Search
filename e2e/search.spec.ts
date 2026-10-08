import { test, expect, type Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Login with Google' }).click();
}
async function search(page: Page, videoId = 'kJQP7kiw5Fk') {
  await page.getByLabel('YouTube video ID or URL').fill(videoId);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
}
test('login, URL search, replies, pagination and logout', async ({ page }) => {
  // The mock provider and service worker must keep the browser off Google.
  let googleRequests = 0;
  await page.route(/https:\/\/(accounts\.google\.com|www\.googleapis\.com|www\.gstatic\.com)/, route => { googleRequests++; return route.abort(); });
  await page.goto('/');
  await expect(page.getByText('Demo mode:', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Login with Google' }).click();
  await search(page, 'https://youtu.be/kJQP7kiw5Fk');
  await expect(page.getByText('This is the first comment')).toBeVisible();
  await expect(page).toHaveURL(/video=kJQP7kiw5Fk/);
  await page.getByRole('button', { name: 'Show replies' }).first().click();
  await expect(page.getByText('Great point!')).toBeVisible();
  await page.getByRole('button', { name: 'Load more comments' }).click();
  await expect(page.getByText('A comment on the next page')).toBeVisible();
  await expect(page.getByText('This is the first comment')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Load more comments' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText('This is the first comment')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Login with Google' })).toBeVisible();
  expect(googleRequests).toBe(0);
});
test('search term filters comments and is shareable', async ({ page }) => {
  await login(page);
  await page.getByLabel('Search term').fill('great');
  await search(page);
  await expect(page.getByText('Another great video!')).toBeVisible();
  await expect(page.getByText('This is the first comment')).toHaveCount(0);
  await expect(page).toHaveURL(/query=great/);
});
test('empty, quota error and expired session', async ({ page }) => {
  await login(page);
  await search(page, 'empty000000');
  await expect(page.getByText('No results found')).toBeVisible();
  await search(page, 'quota000000');
  await expect(page.getByRole('alert')).toContainText('quota exceeded');
  await search(page, 'expired0000');
  await expect(page.getByRole('alert')).toContainText('session expired');
  await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Login with Google' })).toBeVisible();
});
test('invalid input and accessible privacy link', async ({ page }) => {
  await login(page);
  await search(page, 'invalid');
  await expect(page.getByRole('alert')).toContainText('valid YouTube');
  const link = page.getByRole('link', { name: 'Privacy & Terms' });
  await expect(link).toHaveAttribute('href', '/privacy.html');
  expect((await page.request.get('/privacy.html')).status()).toBe(200);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('browser Back restores the previous submitted search', async ({ page }) => {
  await login(page);
  await search(page);
  await expect(page.getByText('This is the first comment')).toBeVisible();
  await page.getByLabel('Search term').fill('great');
  await search(page);
  await expect(page.getByText('Another great video!')).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel('Search term')).toHaveValue('');
  await expect(page.getByText('Another great video!')).toHaveCount(0);
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByText('This is the first comment')).toBeVisible();
});
