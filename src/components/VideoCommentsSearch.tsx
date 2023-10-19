import BigList from './BigList.tsx';
import { useState } from 'react';
import { SearchBar } from './SearchBar/SearchBar.tsx';

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
      <SearchBar
        textBox1={state.textBox1}
        textBox2={state.textBox2}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
      <BigList />
    </div>
  );
};
