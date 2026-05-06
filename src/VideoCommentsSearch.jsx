import React, { Component } from "react";
import "./App.css";
import { Button, TextField } from "@mui/material";
import YoutubeList from "./components/youtubeList/YoutubeList";
import Policy from "./components/TermsAndPolicy";

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
    height: "100%",
  },
  searchResultsList: {
    overflow: "auto",
    height: "100%",
    backgroundColor: "#f5f5f5",
    backgroundImage: "radial-gradient(#cccccc 1px, transparent 1px)",
    backgroundSize: "20px 20px",
  },
};

const youtubeApi = "https://www.googleapis.com/youtube/v3";

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    videoId: params.get("video") || "",
    query: params.get("query") || "",
  };
}

class VideoCommentsSearch extends Component {
  constructor(props) {
    super(props);
    const { videoId, query } = getUrlParams();
    this.state = {
      videoId,
      query,
      searchResultItems: [],
    };
  }

  componentDidMount() {
    window.addEventListener("popstate", this.handlePopState);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.handlePopState);
  }

  handlePopState = () => {
    const { videoId, query } = getUrlParams();
    this.setState({ videoId, query });
  };

  updateUrlParams(videoId, query) {
    const params = new URLSearchParams();
    if (videoId) params.set("video", videoId);
    if (query) params.set("query", query);
    const search = params.toString() ? `?${params.toString()}` : "";
    window.history.pushState({}, "", `${window.location.pathname}${search}`);
  }

  updateVideoId = (event) => {
    const videoId = event.target.value;
    this.setState({ videoId });
    this.updateUrlParams(videoId, this.state.query);
  };

  updateSearchTerm = (event) => {
    const query = event.target.value;
    this.setState({ query });
    this.updateUrlParams(this.state.videoId, query);
  };

  performSearch = (event, nextPage) => {
    event.preventDefault();
    if (!this.state.videoId) return;

    const searchObj = {
      part: "snippet",
      videoId: this.state.videoId,
      key: "AIzaSyC1gZmsaoi4eTBAOOZ--8c4qKB1ZsSobQ0",
      searchTerms: this.state.query || null,
      maxResults: 30,
      pageToken:
        this.state.nextPageToken && nextPage ? this.state.nextPageToken : null,
    };

    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(searchObj).filter(([, v]) => v != null))
    );
    fetch(`${youtubeApi}/commentThreads?${params}`)
      .then((results) => results.json())
      .then((data) => {
        if (data.items) {
          this.setState({
            searchResultItems: [...data.items],
            nextPageToken: data.nextPageToken,
            pageInfo: data.pageInfo,
          });
        }
      });
  };

  renderResults() {
    if (!this.state.searchResultItems || this.state.searchResultItems.length === 0) {
      return <div style={styles.noResults}>No Results found</div>;
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
      <div style={styles.root}>
        <div style={styles.header}>
          <form onSubmit={this.performSearch}>
            <TextField
              type="text"
              label="Youtube video ID"
              helperText="e.g. kJQP7kiw5Fk"
              value={this.state.videoId}
              required
              onChange={this.updateVideoId}
              autoFocus
            />
            <TextField
              type="search"
              label="Search term"
              helperText="e.g. song"
              value={this.state.query}
              onChange={this.updateSearchTerm}
            />
            <Button variant="outlined" color="primary" type="submit">
              Search
            </Button>
          </form>
        </div>
        <div style={styles.searchResultsList}>{this.renderResults()}</div>
        <Policy />
      </div>
    );
  }
}

export default VideoCommentsSearch;

