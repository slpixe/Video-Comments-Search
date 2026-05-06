import { useState, useEffect } from "react";
import type { CSSProperties, ChangeEvent, FormEvent } from "react";
import "./App.css";
import { Alert, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import YoutubeList from "./components/youtubeList/YoutubeList";
import Policy from "./components/TermsAndPolicy";
import type { CommentThread, CommentThreadsResponse, PageInfo } from "./types/youtube";

const styles: Record<string, CSSProperties> = {
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    width: "100%",
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
  },
};

const youtubeApi = "https://www.googleapis.com/youtube/v3";
const apiKey = "AIzaSyC1gZmsaoi4eTBAOOZ--8c4qKB1ZsSobQ0";

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
  const [searchResultItems, setSearchResultItems] = useState<CommentThread[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [pageInfo, setPageInfo] = useState<PageInfo | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const { videoId: vid, query: q } = getUrlParams();
      setVideoId(vid);
      setQuery(q);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function updateUrlParams(vid: string, q: string): void {
    const params = new URLSearchParams();
    if (vid) params.set("video", vid);
    if (q) params.set("query", q);
    const search = params.toString() ? `?${params.toString()}` : "";
    window.history.pushState({}, "", `${window.location.pathname}${search}`);
  }

  function updateVideoId(event: ChangeEvent<HTMLInputElement>): void {
    const newVideoId = event.target.value;
    setVideoId(newVideoId);
    updateUrlParams(newVideoId, query);
  }

  function updateSearchTerm(event: ChangeEvent<HTMLInputElement>): void {
    const newQuery = event.target.value;
    setQuery(newQuery);
    updateUrlParams(videoId, newQuery);
  }

  function performSearch(event: FormEvent, nextPage: boolean): void {
    event.preventDefault();
    if (!videoId) return;

    const searchObj: Record<string, string | number | null | undefined> = {
      part: "snippet",
      videoId,
      key: apiKey,
      searchTerms: query || null,
      maxResults: 30,
      pageToken: nextPageToken && nextPage ? nextPageToken : null,
    };

    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(searchObj)
          .filter((entry): entry is [string, string | number] => entry[1] != null)
          .map(([k, v]) => [k, String(v)])
      )
    );

    setIsLoading(true);
    setError(null);

    fetch(`${youtubeApi}/commentThreads?${params}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body: { error?: { message?: string; errors?: Array<{ reason?: string }> } }) => {
            const reason = body?.error?.errors?.[0]?.reason;
            const knownMessages: Record<string, string> = {
              quotaExceeded: "YouTube API quota exceeded. Please try again later.",
              forbidden: "Access to this video's comments is forbidden.",
            };
            throw new Error(
              (reason !== undefined ? knownMessages[reason] : undefined) ??
                body?.error?.message ??
                `API error ${res.status}`
            );
          });
        }
        return res.json() as Promise<CommentThreadsResponse>;
      })
      .then((data) => {
        setSearchResultItems(data.items ?? []);
        setNextPageToken(data.nextPageToken);
        setPageInfo(data.pageInfo);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div style={styles.root}>
      <div style={styles.header} className="appHeader">
        <Typography variant="h6" component="h1" sx={{ mb: 1.5, fontWeight: 600, letterSpacing: 0.5 }}>
          YouTube Comment Search
        </Typography>
        <form onSubmit={(e) => performSearch(e, false)}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="flex-start">
            <TextField
              type="text"
              label="Video ID"
              helperText="e.g. kJQP7kiw5Fk"
              value={videoId}
              required
              onChange={updateVideoId}
              autoFocus
              size="small"
              sx={{ minWidth: 180 }}
            />
            <TextField
              type="search"
              label="Search term"
              helperText="e.g. song"
              value={query}
              onChange={updateSearchTerm}
              size="small"
              sx={{ minWidth: 200, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading}
              sx={{ mt: "4px", height: 40, whiteSpace: "nowrap" }}
            >
              Search
            </Button>
          </Stack>
        </form>
      </div>
      <div style={styles.searchResultsList} className="searchResultsList">
        {isLoading ? (
          <div style={styles.noResults}>
            <CircularProgress />
          </div>
        ) : error ? (
          <div style={{ padding: 16 }}>
            <Alert severity="error">{error}</Alert>
          </div>
        ) : searchResultItems.length === 0 ? (
          <div style={styles.noResults}>
            <Typography color="text.secondary">No results found</Typography>
          </div>
        ) : (
          <div style={{ height: "100%" }}>
            <YoutubeList
              items={searchResultItems}
              pageInfo={pageInfo}
              search={performSearch}
              apiKey={apiKey}
            />
          </div>
        )}
      </div>
      <Policy />
    </div>
  );
}

export default VideoCommentsSearch;

