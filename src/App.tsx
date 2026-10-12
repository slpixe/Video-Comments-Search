import { useMemo } from 'react';
import { ThemeProvider, useMediaQuery, CssBaseline } from '@mui/material';
import VideoCommentsSearch from './VideoCommentsSearch';
import { createAppTheme } from './theme';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => createAppTheme(prefersDarkMode ? 'dark' : 'light'),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VideoCommentsSearch />
    </ThemeProvider>
  );
}

export default App;
