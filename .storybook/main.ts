import type { StorybookConfig } from '@storybook/react-vite';
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', 'msw-storybook-addon'],
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  async viteFinal(config) { return { ...config, base: '/' }; },
};
export default config;
