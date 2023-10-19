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
import { useState } from 'react';

export const VideoCommentsSearch: React.FC = () => {
  const [state, setState] = useState({
    textBox1: '',
    textBox2: '',
  });

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    console.log('====submit');
    e.preventDefault();
    console.log(state);
  };

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
        <form onSubmit={handleSubmit}>
          <TextField
            helperText="e.g. kJQP7kiw5Fk"
            id="ident"
            label="Youtube video ID"
            style={{ marginRight: '10px' }}
            type="text"
            name="textBox1"
            value={state.textBox1}
            onChange={handleChange}
          />
          <TextField
            helperText="e.g. song"
            id="query"
            label="Search term"
            style={{ marginRight: '10px' }}
            type="text"
            name="textBox2"
            value={state.textBox2}
            onChange={handleChange}
          />
          <Button
            variant="contained"
            size="large"
            endIcon={<SearchIcon />}
            style={{ alignSelf: 'start', paddingTop: '14px', paddingBottom: '14px' }}
            type="submit"
          >
            Send
          </Button>
        </form>
      </Toolbar>
      <BigList />
    </div>
  );
};
