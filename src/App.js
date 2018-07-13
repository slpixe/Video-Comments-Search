import React, { Component } from 'react';
import './App.css'
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField'
import { stringify } from 'query-string'
import YoutubeList from './components/youtubeList/YoutubeList'

const styles = {
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10
  },
  searchButton: {},
  searchResultsList: {
    overflow: 'auto',
    height: '100%',
    background: 'url(http://cdn.backgroundhost.com/backgrounds/subtlepatterns/hexellence.png)'
  }
};

const youtubeApi = 'https://www.googleapis.com/youtube/v3'

class App extends Component {
  constructor (props) {
    super(props)

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
      key: 'AIzaSyBZwa84Tk3PsDzRYe6GDYfVGXcvSfaYxSo',
      searchTerms: (this.state.searchTerm) ? this.state.searchTerm : null,
      maxResults: 30,
      pageToken: (this.state.nextPageToken && nextPage) ? this.state.nextPageToken : null
    }

    fetch(`${youtubeApi}/commentThreads?${stringify(searchObj)}`)
      .then(results => {
        return results.json()
      }).then(data => {
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
      <div style={{height: '100%'}}>
        <YoutubeList
          items={this.state.searchResultItems}
          pageNumber={this.state.pageInfo}
          search={this.performSearch}
        />
      </div>
    )
  }

  render () {
    return (
      <div className={this.props.classes.root}>
        <div className={this.props.classes.header}>
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
        <div className={this.props.classes.searchResultsList}>
          {this.renderResults()}
        </div>
      </div>
    );
  }
}

// export default App;
export default withStyles(styles)(App);
