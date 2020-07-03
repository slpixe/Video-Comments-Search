import React, { Component } from 'react';
import './App.css'
import { withStyles } from '@material-ui/styles';
import {Button} from '@material-ui/core';
import {TextField} from '@material-ui/core'
import queryString from 'qs'
import YoutubeList from './components/youtubeList/YoutubeList'
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';
import history from './history'

const styles = {
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    boxSizing: 'border-box'
  },
  searchButton: {},
  searchResultsList: {
    overflow: 'auto',
    height: '100%',
    background: 'url(http://cdn.backgroundhost.com/backgrounds/subtlepatterns/hexellence.png)'
  }
};

const youtubeApi = 'https://www.googleapis.com/youtube/v3'

const urlPropsQueryConfig = {
  videoId: { type: UrlQueryParamTypes.string, queryParam: 'video' },
  query: { type: UrlQueryParamTypes.string, queryParam: 'query' },
};

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      searchResultItems: []
    }
  }

  componentDidMount() {
    history.listen(() => this.forceUpdate())
  }

  updateVideoId = event => {
    const videoId = event.target.value
    this.props.onChangeVideoId(videoId)
  }

  updateSearchTerm = event => {
    const queryString = event.target.value
    this.props.onChangeQuery(queryString)
  }

  performSearch = (nextPage) => {
    if (!this.props.videoId) return false

    let searchObj = {
      part: 'snippet',
      videoId: this.props.videoId,
      key: 'AIzaSyAC3Jyzw0_2_ZcsIZYa51TzN1AjvnyhFKY',
      searchTerms: (this.props.query) ? this.props.query : null,
      maxResults: 30,
      pageToken: (this.state.nextPageToken && nextPage) ? this.state.nextPageToken : null
    }

    fetch(`${youtubeApi}/commentThreads?${queryString.stringify(searchObj)}`)
      .then(results => {
        return results.json()
      }).then(data => {
      this.setState({
        searchResultItems: [...this.state.searchResultItems, ...data.items],
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
            value={this.props.videoId}
            required={true}
            onChange={event => this.updateVideoId(event)}
          />
          <TextField
            className={this.props.classes.searchBox}
            type={'search'}
            label={'Search term'}
            helperText={'e.g. song'}
            value={this.props.query}
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
export default addUrlProps({ urlPropsQueryConfig })(withStyles(styles)(App));
