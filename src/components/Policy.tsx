import { Typography, Container } from '@mui/material';
const Policy = () => (
  <Container style={{ fontSize: '14px', maxWidth: '100%' }}>
    <Typography variant="h2">Terms of Service</Typography>
    <Typography paragraph>
      By using this website, you agree to our Terms of Service. We don't really have any terms of service ourselves,
      however we use YouTube API Services, and by using this website, you are also agreeing to the YouTube Terms of
      Service, which can be found <a href="https://www.youtube.com/t/terms">here</a>.
    </Typography>

    <Typography variant="h2">Privacy Policy</Typography>
    <Typography paragraph>
      This website uses the YouTube API Services. You can find Google's privacy policy{' '}
      <a href="http://www.google.com/policies/privacy">here</a>.
    </Typography>

    <Typography paragraph>
      We ourselves do not store, collect, or use any data from our users. However, Google may process and share your
      data with internal and external parties.
    </Typography>
    <Typography paragraph>
      We do not collect any data from your device. However, Google may collect data from your device.
    </Typography>
    <Typography paragraph>
      If you have any questions, please contact us at:
      <a href="mailto:slpixe@gmail.com">slpixe@gmail.com</a>
    </Typography>
  </Container>
);

export default Policy;
