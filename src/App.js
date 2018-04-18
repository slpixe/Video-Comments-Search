import React, {Component} from 'react';
import './App.css'

class App extends Component {
  constructor() {
    super()

    this.state = {
      searchTerm: null,
      searchResultItems: null
    }

    fetch('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=IiZ0UBpKpSk&key=AIzaSyBJlwL6yH1qcDJ4A89a0Ap_5ZSk4z0d3Ws')
      .then(results => {
        return results.json()
      }).then(data => {
      console.log(data.items)
      this.setState({
        searchResultItems: data.items,
        nextPageToken: data.nextPageToken,
        pageInfo: data.pageInfo
      })
    })
  }

  updateSearchTerm = event => {
    this.setState({searchTerm: event.target.value})
  }

  renderResults () {
    if (!this.state.searchResultItems) return null;
    return (
      <ul>
        {this.state.searchResultItems.map((data, index) => {
          return (
            <li key={data.id} className={'searchResultsListItem'}>
              {
                `
                ${data.snippet.topLevelComment.snippet.authorDisplayName}
                -
                ${data.snippet.topLevelComment.snippet.textDisplay}
                `
              }
            </li>
          )
        })}
      </ul>
    )
  }

  render() {
    return (
      <div>
        <div>
          <input onChange={event => this.updateSearchTerm(event)} type="search"/>
          <button>Search</button>
          <p className="App-intro">
            This is test
          </p>
        </div>
        <div>
          {this.renderResults()}
        </div>
      </div>
    );
  }
}

export default App;
