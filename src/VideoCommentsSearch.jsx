import React, { useState, useEffect } from "react";
import "./App.css";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
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

function VideoCommentsSearch() {
  const { videoId: initialVideoId, query: initialQuery } = getUrlParams();
  const [videoId, setVideoId] = useState(initialVideoId);
  const [query, setQuery] = useState(initialQuery);
  const [searchResultItems, setSearchResultItems] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(undefined);
  const [pageInfo, setPageInfo] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      const { videoId: vid, query: q } = getUrlParams();
      setVideoId(vid);
      setQuery(q);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function updateUrlParams(vid, q) {
    const params = new URLSearchParams();
    if (vid) params.set("video", vid);
    if (q) params.set("query", q);
    const search = params.toString() ? `?${params.toString()}` : "";
    window.history.pushState({}, "", `${window.location.pathname}${search}`);
  }

  function updateVideoId(event) {
    const newVideoId = event.target.value;
    setVideoId(newVideoId);
    updateUrlParams(newVideoId, query);
  }

  function updateSearchTerm(event) {
    const newQuery = event.target.value;
    setQuery(newQuery);
    updateUrlParams(videoId, newQuery);
  }

  function performSearch(event, nextPage) {
    event.preventDefault();
    if (!videoId) return;

    const searchObj = {
      part: "snippet",
      videoId,
      key: "AIzaSyC1gZmsaoi4eTBAOOZ--8c4qKB1ZsSobQ0",
      searchTerms: query || null,
      maxResults: 30,
      pageToken: nextPageToken && nextPage ? nextPageToken : null,
    };

    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(searchObj).filter(([, v]) => v != null))
    );

    setIsLoading(true);
    setError(null);

    fetch(`${youtubeApi}/commentThreads?${params}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            const reason = body?.error?.errors?.[0]?.reason;
            const knownMessages = {
              quotaExceeded: "YouTube API quota exceeded. Please try again later.",
              forbidden: "Access to this video's comments is forbidden.",
            };
            throw new Error(
              knownMessages[reason] ??
                body?.error?.message ??
                `API error ${res.status}`
            );
          });
        }
        return res.json();
      })
      .then((data) => {
        setSearchResultItems(data.items ?? []);
        setNextPageToken(data.nextPageToken);
        setPageInfo(data.pageInfo);
      })
      .catch((err) => {
        setError(err.message ?? "Something went wrong. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <form onSubmit={performSearch}>
          <TextField
            type="text"
            label="Youtube video ID"
            helperText="e.g. kJQP7kiw5Fk"
            value={videoId}
            required
            onChange={updateVideoId}
            autoFocus
          />
          <TextField
            type="search"
            label="Search term"
            helperText="e.g. song"
            value={query}
            onChange={updateSearchTerm}
          />
          <Button variant="outlined" color="primary" type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>
      </div>
      <div style={styles.searchResultsList}>
        {isLoading ? (
          <div style={styles.noResults}>
            <CircularProgress />
          </div>
        ) : error ? (
          <div style={{ padding: 16 }}>
            <Alert severity="error">{error}</Alert>
          </div>
        ) : searchResultItems.length === 0 ? (
          <div style={styles.noResults}>No Results found</div>
        ) : (
          <div style={{ height: "100%" }}>
            <YoutubeList
              items={searchResultItems}
              pageInfo={pageInfo}
              search={performSearch}
            />
          </div>
        )}
      </div>
      <Policy />
    </div>
  );
}

export default VideoCommentsSearch;

