import React, {Component} from 'react';
import { InfiniteLoader, List, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

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

    console.log('loadMoreRows', startIndex, stopIndex, increment)
    console.log('loadMoreRows-loadedMap', loadedRowsMap, loadingRowCount)
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
    // return !!list[index];
    const {loadedRowsMap} = this.state;
    // console.log('isRowLoaded', !!loadedRowsMap[index]);
    return !!loadedRowsMap[index]; // STATUS_LOADING or STATUS_LOADED
  }

  rowRenderer = ({index, key, style}) => {
    const {loadedRowsMap} = this.state;
    const row = this.list[index];
    // console.log("rowRenderer-row", row);
    let content;

    // console.log(row);

    if (loadedRowsMap[index] === STATUS_LOADED) {
      // content = row.name;
      content = row.snippet.topLevelComment.snippet.textDisplay
    } else {
      content = (
        <div style={{width: row.size}}>LOADING</div>
      );
    }

    // console.log('rowRenderer-content', content);

    return (
      <div
        key={key}
        // key={row.id}
        style={style}
      >
        {content}
      </div>
    );

    // const timestamp = data.snippet.topLevelComment.snippet.publishedAt
  }

  render () {
    const {loadedRowCount, loadingRowCount} = this.state;

    return (
      <div style={{height: '100%'}}>
        <div>
          {loadingRowCount} loading, {loadedRowCount} loaded
        </div>
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.loadMoreRows}
          rowCount={this.list.length}>
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