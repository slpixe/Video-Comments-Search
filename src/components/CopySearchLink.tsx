import { useEffect, useRef, useState } from 'react';
import { Button, TextField } from '@mui/material';
import { CheckRounded, LinkRounded } from '@mui/icons-material';

export default function CopySearchLink() {
  const [copied, setCopied] = useState(false);
  const [manualLink, setManualLink] = useState('');
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeout.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setManualLink('');
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setManualLink(window.location.href);
    }
  }

  return (
    <div className="copySearch">
      <Button variant="text" startIcon={copied ? <CheckRounded /> : <LinkRounded />} onClick={() => void copy()}>
        <span aria-live="polite">{copied ? 'Link copied' : 'Copy search link'}</span>
      </Button>
      {manualLink && <TextField label="Copy this search link" value={manualLink} size="small" fullWidth
        helperText="Select and copy the link to share this search."
        InputProps={{ readOnly: true }} onFocus={event => event.target.select()} />}
    </div>
  );
}
