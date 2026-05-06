import React from 'react';

function YoutubeList({ items }) {
  return (
    <div style={{ height: '100%' }}>
      {items.map(item => (
        <div key={item.id} className={'searchItem'}>
          {item.snippet.topLevelComment.snippet.textOriginal}
        </div>
      ))}
    </div>
  );
}

export default YoutubeList;