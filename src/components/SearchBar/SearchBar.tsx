import { Button, TextField, Toolbar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ChangeEvent, FormEvent } from 'react';

interface IProps {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  textBox1: string;
  textBox2: string;
}

export const SearchBar = (props: IProps) => {
  return (
    <Toolbar style={{ display: 'flex', justifyContent: 'center' }}>
      <form onSubmit={props.handleSubmit}>
        <TextField
          helperText="e.g. kJQP7kiw5Fk"
          id="ident"
          label="Youtube video ID"
          style={{ marginRight: '10px' }}
          type="text"
          name="textBox1"
          value={props.textBox1}
          onChange={props.handleChange}
          required
        />
        <TextField
          helperText="e.g. song"
          id="query"
          label="Search term"
          style={{ marginRight: '10px' }}
          type="text"
          name="textBox2"
          value={props.textBox2}
          onChange={props.handleChange}
          required
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
  );
};
