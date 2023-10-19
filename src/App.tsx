import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { VideoCommentsSearch } from './components/VideoCommentsSearch';
import Policy from './components/Policy';

// function Copyright() {
//   return (
//     <Typography variant="body2" color="text.secondary" align="center">
//       {'Copyright © '}
//       <Link color="inherit" href="https://mui.com/">
//         Your Website
//       </Link>{' '}
//       {new Date().getFullYear()}.
//     </Typography>
//   );
// }

export default function App() {
  return (
    <>
      <Container style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0, maxWidth: '100%' }}>
        <Box sx={{ my: 2, flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
          <VideoCommentsSearch />
        </Box>
        <Box style={{ flexShrink: 0, maxWidth: '100%', fontSize: '14px', display: 'flex', flexDirection: 'column' }}>
          <Policy />
        </Box>
      </Container>
    </>
  );
}
