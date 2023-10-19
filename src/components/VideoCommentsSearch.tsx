import BigList from './BigList.tsx';
import { useState } from 'react';
import { SearchBar } from './SearchBar/SearchBar.tsx';
import { Box } from '@mui/material';

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
    <Box className={'root'} sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
      <SearchBar
        textBox1={state.textBox1}
        textBox2={state.textBox2}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: 'background.paper',
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column',
        }}
      >
        <BigList />
      </Box>
    </Box>
  );
};
