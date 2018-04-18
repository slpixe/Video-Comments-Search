import React, {Component} from 'react';
import './App.css'
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField'
import List, {
  ListItem,
  ListItemText,
} from 'material-ui/List';

class App extends Component {
  constructor() {
    super()

    this.state = {
      searchTerm: null,
      searchResultItems: null
    }
  }

  updateSearchTerm = event => {
    this.setState({searchTerm: event.target.value})
  }

  performSearch = () => {
    if (!this.state.searchTerm) return false

    fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${this.state.searchTerm}&key=AIzaSyBJlwL6yH1qcDJ4A89a0Ap_5ZSk4z0d3Ws`)
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
      <div>
        <div>
          <TextField type={'search'} label={'Youtube video ID'} onChange={event => this.updateSearchTerm(event)}/>
          <Button variant="raised" color="primary" onClick={this.performSearch}>Search</Button>
        </div>
        <div>
          {this.renderResults()}
        </div>
      </div>
    );
  }
}

export default App;
