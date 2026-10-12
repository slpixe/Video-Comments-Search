import { createTheme, type PaletteMode } from '@mui/material';

export function createAppTheme(mode: PaletteMode) {
  const dark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? '#A8C5FF' : '#2459C4', contrastText: dark ? '#142238' : '#FFFFFF' },
      background: { default: dark ? '#142238' : '#F3F6FA', paper: dark ? '#1C2D46' : '#FFFFFF' },
      text: { primary: dark ? '#E8EFFA' : '#172B46', secondary: dark ? '#AFBED3' : '#5D6D82' },
      divider: dark ? '#34465F' : '#DCE3ED',
    },
    typography: {
      fontFamily: '"Avenir Next", "Trebuchet MS", sans-serif',
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            '--page-bg': dark ? '#142238' : '#F3F6FA',
            '--surface': dark ? '#1C2D46' : '#FFFFFF',
            '--ink': dark ? '#E8EFFA' : '#172B46',
            '--muted': dark ? '#AFBED3' : '#5D6D82',
            '--line': dark ? '#34465F' : '#DCE3ED',
            '--accent': dark ? '#A8C5FF' : '#2459C4',
            '--accent-soft': dark ? '#253D61' : '#E8EFFC',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { minHeight: 44, paddingInline: 18, fontSize: '0.875rem' } },
      },
      MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: dark ? '#142238' : '#FFFFFF' } } },
      MuiLink: { defaultProps: { underline: 'hover' } },
    },
  });
}
