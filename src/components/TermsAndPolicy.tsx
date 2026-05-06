import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GavelIcon from "@mui/icons-material/Gavel";

const Policy = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="policyFooter">
        <Button
          size="small"
          startIcon={<GavelIcon fontSize="small" />}
          onClick={() => setOpen(true)}
          color="inherit"
          sx={{ opacity: 0.6, fontSize: "0.75rem" }}
        >
          Terms &amp; Privacy
        </Button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Terms &amp; Privacy
          <IconButton autoFocus aria-label="close" onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>Terms of Service</Typography>
          <Typography variant="body2" paragraph>
            By using this website, you agree to our Terms of Service.
            We don&apos;t really have any terms of service ourselves, however we use YouTube API
            Services, and by using this website you are also agreeing to the{" "}
            <a href="https://www.youtube.com/t/terms" rel="nofollow noreferrer noopener" target="_blank">
              YouTube Terms of Service
            </a>.
          </Typography>

          <Typography variant="h6" gutterBottom>Privacy Policy</Typography>
          <Typography variant="body2" paragraph>
            This website uses the YouTube API Services. You can find Google&apos;s{" "}
            <a href="https://policies.google.com/privacy" rel="nofollow noreferrer noopener" target="_blank">
              privacy policy here
            </a>.
          </Typography>
          <Typography variant="body2" paragraph>
            We ourselves do not store, collect, or use any data from our users.
            However, Google may process and share your data with internal and external parties.
          </Typography>
          <Typography variant="body2" paragraph>
            We do not collect any data from your device. However, Google may collect data from your device.
          </Typography>
          <Typography variant="body2">
            Questions?{" "}
            <a href="mailto:slpixe@gmail.com">slpixe@gmail.com</a>
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Policy;
