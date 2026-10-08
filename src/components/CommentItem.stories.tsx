import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { http, HttpResponse } from 'msw';
import { YOUTUBE_API } from '../api/youtube';
import { commentThreadsFixture } from '../mocks/fixtures/commentThreads';
import CommentItem from './CommentItem';
const meta = { title: 'Search/Comment', component: CommentItem, tags: ['autodocs'], args: { item: commentThreadsFixture.items[0], index: 0, accessToken: 'mock-access-token' } } satisfies Meta<typeof CommentItem>;
export default meta;
type Story = StoryObj<typeof meta>;
export const WithReplies: Story = {};
export const NoReplies: Story = { args: { item: commentThreadsFixture.items[1] } };
export const Expanded: Story = { play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole('button', { name: 'Show replies' }));
  await expect(await canvas.findByText('Great point!')).toBeVisible();
} };
export const ReplyError: Story = {
  parameters: { msw: [http.get(`${YOUTUBE_API}/comments`, () => new HttpResponse('Bad gateway', { status: 502 }))] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show replies' }));
    await expect(await canvas.findByRole('alert')).toHaveTextContent('502');
  },
};
