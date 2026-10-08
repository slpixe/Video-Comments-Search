import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './storybook-tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/storybook', open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:6007', trace: 'retain-on-failure', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'pnpm exec vite preview --outDir storybook-static --host 127.0.0.1 --port 6007 --strictPort',
    url: 'http://127.0.0.1:6007',
    reuseExistingServer: false,
  },
});
