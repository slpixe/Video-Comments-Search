import React, {Component} from 'react';
import { InfiniteLoader, List, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once
// import Immutable from 'immutable';

const STATUS_LOADING = 1;
const STATUS_LOADED = 2;

class YoutubeList extends Component {
  state = {
    loadedRowCount: 0,
    loadedRowsMap: {},
    loadingRowCount: 0,
  }

  timeoutIdMap = {};

  list = this.props.items;

  componentWillUnmount() {
    Object.keys(this.timeoutIdMap).forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
  }

  loadMoreRows = ({startIndex, stopIndex}) => {
    const {loadedRowsMap, loadingRowCount} = this.state;
    const increment = stopIndex - startIndex + 1;

    console.log('loadMoreRows Start, Stop, Increment', startIndex, stopIndex, increment)
    // console.log('loadMoreRows-loadedMap', loadedRowsMap)
    console.log('loadMoreRows-loadingRowCount', loadingRowCount)

    this.props.search(true)

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
    const {loadedRowsMap} = this.state;
    return !!loadedRowsMap[index]; // STATUS_LOADING or STATUS_LOADED
  }

  rowRenderer = ({index, key, style}) => {
    const {loadedRowsMap} = this.state;
    const row = this.list[index];
    let content;

    if (loadedRowsMap[index] === STATUS_LOADED) {
      content = `${index}: ${row.snippet.topLevelComment.snippet.textDisplay}`
    } else {
      content = (
        <div style={{width: row.size}}>LOADING</div>
      );
    }

    return (
      <div
        key={key}
        style={style}
      >
        {content}
      </div>
    );
  }

  render () {
    console.log('list length: ', this.props.items.length);
    const {loadedRowCount, loadingRowCount} = this.state;

    return (
      <div style={{height: '100%'}}>
        <div>
          {loadingRowCount} loading, {loadedRowCount} loaded
        </div>
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.loadMoreRows}
          minimumBatchSize={30}
          // rowCount={this.list.length}>
          rowCount={9999}>
          {({onRowsRendered, registerChild}) => (
            <AutoSizer disableHeight>
              {({width}) => (
                <List
                  ref={registerChild}
                  height={200}
                  onRowsRendered={onRowsRendered}
                  rowCount={this.list.length}
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