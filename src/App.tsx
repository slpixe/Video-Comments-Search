import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { VideoCommentsSearch } from './components/VideoCommentsSearch';

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
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <VideoCommentsSearch />
        {/* <ProTip /> */}
        {/* <Copyright /> */}
      </Box>
    </Container>
  );
}
