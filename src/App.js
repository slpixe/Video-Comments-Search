import React, { Component } from 'react';
import './App.css'
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField'
import List, {
  ListItem,
  ListItemText,
} from 'material-ui/List';
import { stringify } from 'query-string'
import * as moment from 'moment'
import YoutubeList from './components/youtubeList/YoutubeList'

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
  searchButton: {},
  searchResultsList: {
    overflow: 'auto',
    maxHeight: 300
  }
};

const youtubeApi = 'https://www.googleapis.com/youtube/v3'

class App extends Component {
  constructor () {
    super()

    this.state = {
      videoId: null,
      searchResultItems: [],
      // searchResultItems: null,
      searchTerm: null
    }
  }

  updateVideoId = event => {
    this.setState({videoId: event.target.value})
  }

  updateSearchTerm = event => {
    this.setState({searchTerm: event.target.value})
  }

  performSearch = (nextPage) => {
    if (!this.state.videoId) return false

    let searchObj = {
      part: 'snippet',
      videoId: this.state.videoId,
      key: 'AIzaSyBJlwL6yH1qcDJ4A89a0Ap_5ZSk4z0d3Ws',
      searchTerms: (this.state.searchTerm) ? this.state.searchTerm : null,
      maxResults: 30,
      pageToken: (this.state.nextPageToken && nextPage) ? this.state.nextPageToken : null
    }
    // console.log(searchObj)

    fetch(`${youtubeApi}/commentThreads?${stringify(searchObj)}`)
      .then(results => {
        return results.json()
      }).then(data => {

      console.log(data)

      this.setState({
        searchResultItems: [...this.state.searchResultItems, ...data.items],
        // searchResultItems: data.items,
        // searchResultItems: this.state.searchResultItems.concat(data.items),
        nextPageToken: data.nextPageToken,
        pageInfo: data.pageInfo
      })
    })
  }

  renderResults () {
    if (!this.state.searchResultItems || this.state.searchResultItems.length === 0) return null;
    return (
      <div>
        <YoutubeList
          items={this.state.searchResultItems}
          pageNumber={this.state.pageInfo}
          search={this.performSearch}
        />
        {/*<List dense={true} className={this.props.classes.searchResultsList}>*/}
        {/*{this.state.searchResultItems.map((data, index) => {*/}
        {/*const timestamp = data.snippet.topLevelComment.snippet.publishedAt*/}
        {/*return (*/}
        {/*<ListItem key={data.id}>*/}
        {/*<ListItemText*/}
        {/*primary={data.snippet.topLevelComment.snippet.textDisplay}*/}
        {/*secondary={`${data.snippet.topLevelComment.snippet.authorDisplayName} - ${moment(timestamp).fromNow()}`}*/}
        {/*/>*/}
        {/*</ListItem>*/}
        {/*)*/}
        {/*})}*/}
        {/*</List>*/}
      </div>
    )
  }

  render () {
    return (
      <div className={this.props.classes.root}>
        <div className={this.props.classes.searchBar}>
          <TextField
            className={this.props.classes.searchBox}
            type={'text'}
            label={'Youtube video ID'}
            helperText={'e.g. kJQP7kiw5Fk'}
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
