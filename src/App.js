import React, { Component } from 'react';
import VideoCommentsSearch from './VideoCommentsSearch';
import history from './history';

class App extends Component {
  componentDidMount() {
    // force an update if the URL changes
    history.listen(() => this.forceUpdate());
  }

  render() {
    return (
      <VideoCommentsSearch />
    );
  }
}

export default App;