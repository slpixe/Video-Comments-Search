import type { StorybookConfig } from '@storybook/react-vite';
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', 'msw-storybook-addon'],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  async viteFinal(config) { return { ...config, base: '/', define: { ...config.define, 'import.meta.env.VITE_YOUTUBE_API_KEY': JSON.stringify('mock-youtube-api-key') } }; },
};
export default config;
