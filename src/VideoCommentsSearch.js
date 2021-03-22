import React, { Component } from "react";
import "./App.css";
import { withStyles } from "@material-ui/styles";
import { Button, TextField, FormControl } from "@material-ui/core";
import queryString from "qs";
import YoutubeList from "./components/youtubeList/YoutubeList";
import { addUrlProps, UrlQueryParamTypes } from "react-url-query";
import history from "./history";

const styles = {
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    boxSizing: "border-box",
  },
  noResults: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%"
  },
  searchButton: {},
  searchResultsList: {
    overflow: "auto",
    height: "100%",
    background:
      "url(http://cdn.backgroundhost.com/backgrounds/subtlepatterns/hexellence.png)",
  },
};

const youtubeApi = "https://www.googleapis.com/youtube/v3";

const urlPropsQueryConfig = {
  videoId: { type: UrlQueryParamTypes.string, queryParam: "video" },
  query: { type: UrlQueryParamTypes.string, queryParam: "query" },
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResultItems: []
    };
  }

  componentDidMount() {
    history.listen(() => this.forceUpdate());
  }

  updateVideoId = (event) => {
    const videoId = event.target.value;
    this.props.onChangeVideoId(videoId);
  };

  updateSearchTerm = (event) => {
    const queryString = event.target.value;
    this.props.onChangeQuery(queryString);
  };

  performSearch = (event, nextPage) => {
    event.preventDefault();
    if (!this.props.videoId) return false;

    let searchObj = {
      part: "snippet",
      videoId: this.props.videoId,
      key: "AIzaSyC1gZmsaoi4eTBAOOZ--8c4qKB1ZsSobQ0",
      searchTerms: this.props.query ? this.props.query : null,
      maxResults: 30,
      pageToken:
        this.state.nextPageToken && nextPage ? this.state.nextPageToken : null,
    };

    fetch(`${youtubeApi}/commentThreads?${queryString.stringify(searchObj)}`)
      .then((results) => {
        return results.json();
      })
      .then((data) => {

        // if(!data.items) {
        //   this.setState({
        //     noResults: true
        //   });
        // }

        this.setState({
          searchResultItems: [...data.items],
          nextPageToken: data.nextPageToken,
          pageInfo: data.pageInfo
        });
      });
  };

  renderResults() {
    if (
      !this.state.searchResultItems ||
      this.state.searchResultItems.length === 0
    ) {
      return (
        <div className={this.props.classes.noResults}>
          No Results found
        </div>
      )
    }

    return (
      <div style={{ height: "100%" }}>
        <YoutubeList
          items={this.state.searchResultItems}
          pageNumber={this.state.pageInfo}
          search={this.performSearch}
        />
      </div>
    );
  }

  render() {
    return (
      <div className={this.props.classes.root}>
        <div className={this.props.classes.header}>
          <form onSubmit={this.performSearch}>
            <TextField
              className={this.props.classes.searchBox}
              type={"text"}
              label={"Youtube video ID"}
              helperText={"e.g. kJQP7kiw5Fk"}
              value={this.props.videoId}
              required={true}
              onChange={(event) => this.updateVideoId(event)}
              autoFocus
            />
            <TextField
              className={this.props.classes.searchBox}
              type={"search"}
              label={"Search term"}
              helperText={"e.g. song"}
              value={this.props.query || ""}
              required={false}
              onChange={(event) => this.updateSearchTerm(event)}
            />
            <Button
              className={this.props.classes.searchButton}
              variant="outlined"
              color="primary"
              // onClick={this.performSearch}
              type="submit"
            >
              Search
            </Button>
          </form>
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
