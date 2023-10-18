import React, { Component } from 'react';
import VideoCommentsSearch from './VideoCommentsSearch';
import history from './history';
import { ThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';

const theme = createMuiTheme();

const useStyles = makeStyles((theme) => {
  root: {
    // some CSS that accesses the theme
  }
});

class App extends Component {
  componentDidMount() {
    // force an update if the URL changes
    history.listen(() => this.forceUpdate());
  }

  render() {
    return (
      <>
      <ThemeProvider theme={theme}>
      <VideoCommentsSearch />
      </ThemeProvider>
      </>
    );
  }
}

export default App;