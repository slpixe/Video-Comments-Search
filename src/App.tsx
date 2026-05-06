import { useMemo } from 'react';
import { createTheme, ThemeProvider, useMediaQuery, CssBaseline } from '@mui/material';
import VideoCommentsSearch from './VideoCommentsSearch';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => createTheme({ palette: { mode: prefersDarkMode ? 'dark' : 'light' } }),
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