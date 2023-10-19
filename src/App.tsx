import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { VideoCommentsSearch } from './components/VideoCommentsSearch';
import { Query } from './components/Query';

export default function App() {
  return (
    <>
      <Container
        style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0, maxWidth: '100%' }}
        disableGutters={true}
      >
        <Box sx={{ marginTop: 2, flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
          <VideoCommentsSearch />
          <Query />
        </Box>
      </Container>
    </>
  );
}
