import {
  Button,
  FormControl,
  FormGroup,
  FormHelperText,
  Input,
  InputLabel,
  TextField,
  Toolbar,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BigList from './BigList.tsx';

export const VideoCommentsSearch: React.FC = () => {
  return (
    <div className={'root'}>
      {/* <FormControl row> */}
      {/* <FormGroup row>
        <TextField helperText="e.g. kJQP7kiw5Fk" id="ident" label="Youtube video ID" />
        <TextField helperText="e.g. song" id="query" label="Search term" />
      </FormGroup>
      <Button variant="contained" size="small" endIcon={<SearchIcon />}>
        Send
      </Button> */}
      {/* </FormControl> */}
      <Toolbar style={{ display: 'flex', justifyContent: 'center' }}>
        <TextField helperText="e.g. kJQP7kiw5Fk" id="ident" label="Youtube video ID" style={{ marginRight: '10px' }} />
        <TextField helperText="e.g. song" id="query" label="Search term" style={{ marginRight: '10px' }} />
        <Button
          variant="contained"
          size="large"
          endIcon={<SearchIcon />}
          style={{ alignSelf: 'start', paddingTop: '14px', paddingBottom: '14px' }}
        >
          Send
        </Button>
      </Toolbar>
      <BigList />
    </div>
  );
};
