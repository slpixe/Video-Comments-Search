import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { delay, http, HttpResponse } from 'msw';
import { YOUTUBE_API } from './api/youtube';
import VideoCommentsSearch from './VideoCommentsSearch';

const meta = { title: 'Search/App', component: VideoCommentsSearch, tags: ['autodocs'] } satisfies Meta<typeof VideoCommentsSearch>;
export default meta;
type Story = StoryObj<typeof meta>;
async function submit(canvasElement: HTMLElement, videoId: string) {
  const canvas = within(canvasElement);
  await userEvent.clear(canvas.getByRole('textbox', { name: 'YouTube video ID or URL' }));
  await userEvent.type(canvas.getByRole('textbox', { name: 'YouTube video ID or URL' }), videoId);
  await userEvent.click(canvas.getByRole('button', { name: 'Search' }));
  return canvas;
}
export const LoggedOut: Story = { parameters: { auth: { signedIn: false } } };
export const Ready: Story = {};
export const Results: Story = { play: async ({ canvasElement }) => {
  const canvas = await submit(canvasElement, 'kJQP7kiw5Fk');
  await expect(await canvas.findByText('This is the first comment')).toBeVisible();
} };
export const Empty: Story = { play: async ({ canvasElement }) => {
  const canvas = await submit(canvasElement, 'empty000000');
  await expect(await canvas.findByText('No results found')).toBeVisible();
} };
export const QuotaError: Story = { play: async ({ canvasElement }) => {
  const canvas = await submit(canvasElement, 'quota000000');
  await expect(await canvas.findByRole('alert')).toHaveTextContent('quota exceeded');
} };
export const ExpiredSession: Story = { play: async ({ canvasElement }) => {
  const canvas = await submit(canvasElement, 'expired0000');
  await expect(await canvas.findByRole('alert')).toHaveTextContent('session expired');
} };

export const Loading: Story = {
  parameters: { msw: [http.get(`${YOUTUBE_API}/commentThreads`, async () => { await delay('infinite'); return HttpResponse.json({ items: [] }); })] },
  play: async ({ canvasElement }) => { await submit(canvasElement, 'kJQP7kiw5Fk'); },
};
