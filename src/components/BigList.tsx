import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useComments } from '../api/ytc';
import React from 'react';

interface YTCRow extends ListChildComponentProps {
  text: string;
}

// function renderRow(props: YTCRow) {
//   const { index, style, data } = props;

//   return (
//     <ListItem style={style} key={index} component="div" disablePadding>
//       <ListItemButton>
//         <ListItemText primary={`Item ${text}`} />
//       </ListItemButton>
//     </ListItem>
//   );
// }

// const Row = ({ index, style, data }: YTCRow) => (
//   <ListItem style={style} key={index}>
//     <ListItemText primary={data[index]} />
//   </ListItem>
// );

const Row = React.memo((props: ListChildComponentProps) => {
  const { index, style, data } = props;

  console.log('==dd', data);

  const item = data.items[index];

  return (
    <ListItem style={style} key={index}>
      <ListItemText primary={item.snippet.topLevelComment.snippet.textDisplay} />
    </ListItem>
  );
});

export default function BigList() {
  const { data, error, isFetching, status } = useComments();

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (status === 'error' || error) {
    return <div>Error!</div>;
  }

  if (!data) {
    return <div>No Data!</div>;
  }

  console.log('=d', data);

  // const Row = ({ index, style }) => (
  //   <div style={style}>{data.items[index].snippet.topLevelComment.snippet.textDisplay}</div>
  // );

  return (
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
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemSize={46}
            itemCount={data.items.length}
            overscanCount={5}
            itemData={data}
          >
            {/* {renderRow} */}
            {Row}
            {/* <renderRow /> */}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Box>
  );
}
