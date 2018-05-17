import React, {Component} from 'react';
import { InfiniteLoader, List, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

const STATUS_LOADING = 1;
const STATUS_LOADED = 2;

const list = [
  {name: 'a'},
  {name: 'b'},
  {name: 'c'},
  {name: 'd'},
  {name: 'e'},
  {name: 'f'},
  {name: 'g'},
  {name: 'h'},
  {name: 'i'},
  {name: 'j'},
  {name: 'k'},
  {name: 'l'},
  {name: 'm'},
  {name: 'n'},
  {name: 'o'},
  {name: 'p'},
  {name: 'q'},
  {name: 'r'},
  {name: 's'},
]

class YoutubeList extends Component {
  state = {
    loadedRowCount: 0,
    loadedRowsMap: {},
    loadingRowCount: 0,
  }

  timeoutIdMap = {};

  loadMoreRows = ({startIndex, stopIndex}) => {
    console.log('loadMoreRows')
    const {loadedRowsMap, loadingRowCount} = this.state;
    const increment = stopIndex - startIndex + 1;

    for (var i = startIndex; i <= stopIndex; i++) {
      loadedRowsMap[i] = STATUS_LOADING;
    }

    this.setState({
      loadingRowCount: loadingRowCount + increment,
    });

    const timeoutId = setTimeout(() => {
      const {loadedRowCount, loadingRowCount} = this.state;

      delete this.timeoutIdMap[timeoutId];

      for (var i = startIndex; i <= stopIndex; i++) {
        loadedRowsMap[i] = STATUS_LOADED;
      }

      this.setState({
        loadingRowCount: loadingRowCount - increment,
        loadedRowCount: loadedRowCount + increment,
      });

      promiseResolver();
    }, 1000 + Math.round(Math.random() * 2000));

    this.timeoutIdMap[timeoutId] = true;

    let promiseResolver;

    return new Promise(resolve => {
      promiseResolver = resolve;
    });
  }

  isRowLoaded = ({ index }) => {
    // return !!list[index];
    const {loadedRowsMap} = this.state;
    return !!loadedRowsMap[index]; // STATUS_LOADING or STATUS_LOADED
  }

  rowRenderer = ({index, key, style}) => {
    const {loadedRowsMap} = this.state;
    const row = list[index];
    let content;

    if (loadedRowsMap[index] === STATUS_LOADED) {
      content = row.name;
    } else {
      content = (
        <div style={{width: row.size}} />
      );
    }

    return (
      <div key={key} style={style}>
        {content}
      </div>
    );
  }

  render () {
    const {loadedRowCount, loadingRowCount} = this.state;

    return (
      <div>
        <div>
          {loadingRowCount} loading, {loadedRowCount} loaded
        </div>
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.loadMoreRows}
          rowCount={list.length}>
          {({onRowsRendered, registerChild}) => (
            <AutoSizer disableHeight>
              {({width}) => (
                <List
                  ref={registerChild}
                  height={200}
                  onRowsRendered={onRowsRendered}
                  rowCount={list.length}
                  rowHeight={30}
                  rowRenderer={this.rowRenderer}
                  width={width}
                />
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
    )
  }
}

export default YoutubeList;