import type { Preview } from '@storybook/react-vite';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { MockAuthProvider } from '../src/mocks/MockAuthProvider';
import { handlers } from '../src/mocks/handlers';
import '../src/App.css';
const preview: Preview = {
  loaders: [mswLoader()],
  beforeEach: () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('video');
    url.searchParams.delete('query');
    window.history.replaceState({}, '', url);
  },
  parameters: { layout: 'fullscreen', msw: handlers, auth: { signedIn: true } },
  globalTypes: { theme: { description: 'Color scheme', toolbar: { icon: 'circlehollow', items: ['light', 'dark'] } } },
  initialGlobals: { theme: 'light' },
  decorators: [(Story, context) => <ThemeProvider theme={createTheme({ palette: { mode: context.globals.theme === 'dark' ? 'dark' : 'light' } })}><CssBaseline /><MockAuthProvider key={context.id} signedIn={context.parameters.auth.signedIn}><div style={{ height: '100vh' }}><Story /></div></MockAuthProvider></ThemeProvider>],
};
export default preview;
