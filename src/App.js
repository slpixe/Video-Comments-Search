import React, {Component} from 'react';
import './App.css'
import {withStyles} from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField'
import Typography from 'material-ui/Typography';
import List, {
  ListItem,
  ListItemText,
} from 'material-ui/List';
import {stringify} from 'query-string'

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  searchBar: {
    marginLeft: 20,
    marginRight: 20,
    flexGrow: 1
  },
  searchBox: {
    flex: 1
  },
  searchButton: {}
};

const youtubeApi = 'https://www.googleapis.com/youtube/v3'

class App extends Component {
  constructor() {
    super()

    this.state = {
      videoId: null,
      searchResultItems: null,
      searchTerm: null
    }
  }

  updateVideoId = event => {
    this.setState({videoId: event.target.value})
  }

  updateSearchTerm = event => {
    this.setState({searchTerm: event.target.value})
  }

  performSearch = () => {
    if (!this.state.videoId) return false

    let searchObj = {
      part: 'snippet',
      videoId: this.state.videoId,
      key: 'AIzaSyBJlwL6yH1qcDJ4A89a0Ap_5ZSk4z0d3Ws',
      searchTerm: (this.state.searchTerm) ? this.state.searchTerm : null
    }
    console.log(searchObj)

    fetch(`${youtubeApi}/commentThreads?${stringify(searchObj)}`)
      .then(results => {
        return results.json()
      }).then(data => {
      this.setState({
        searchResultItems: data.items,
        nextPageToken: data.nextPageToken,
        pageInfo: data.pageInfo
      })
    })
  }

  renderResults() {
    if (!this.state.searchResultItems) return null;
    return (
      <List dense={true}>
        {this.state.searchResultItems.map((data, index) => {
          return (
            <ListItem key={data.id}>
              <ListItemText
                primary={data.snippet.topLevelComment.snippet.textDisplay}
                secondary={data.snippet.topLevelComment.snippet.authorDisplayName}
              />
            </ListItem>
          )
        })}}
      </List>
    )
  }

  render() {
    return (
      <div className={this.props.classes.root}>
        <div className={this.props.classes.searchBar}>
          <TextField
            className={this.props.classes.searchBox}
            type={'text'}
            label={'Youtube video ID'}
            helperText={'e.g. gocwRvLhDf8'}
            required={true}
            onChange={event => this.updateVideoId(event)}
          />
          <TextField
            className={this.props.classes.searchBox}
            type={'search'}
            label={'Search term'}
            helperText={'e.g. song'}
            required={false}
            onChange={event => this.updateSearchTerm(event)}
          />
          <Button
            className={this.props.classes.searchButton}
            variant="raised"
            color="primary"
            onClick={this.performSearch}
          >
            Search
          </Button>
        </div>
        <div className={'header'}>
        </div>
        <div>
          {this.renderResults()}
        </div>
      </div>
    );
  }
}

// export default App;
export default withStyles(styles)(App);
