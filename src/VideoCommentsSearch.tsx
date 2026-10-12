import { useState, useEffect, useRef } from 'react';
import { Alert, Button, CircularProgress, InputAdornment, TextField } from '@mui/material';
import { SearchRounded, SmartDisplayOutlined, ForumOutlined, OpenInNewRounded } from '@mui/icons-material';
import YoutubeList from './components/youtubeList/YoutubeList';
import CopySearchLink from './components/CopySearchLink';
import Policy from './components/TermsAndPolicy';
import { useAuth } from './auth/AuthProvider';
import { parseVideoId, searchComments } from './api/youtube';
import type { CommentThread } from './types/youtube';
import './App.css';

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return { videoId: params.get('video') || '', query: params.get('query') || '' };
}
function updateUrl(videoId: string, query: string, push = false) {
  const url = new URL(window.location.href);
  if (videoId) url.searchParams.set('video', videoId); else url.searchParams.delete('video');
  if (query) url.searchParams.set('query', query); else url.searchParams.delete('query');
  window.history[push ? 'pushState' : 'replaceState']({}, '', url);
}

function VideoCommentsSearch() {
  const initial = getUrlParams();
  const [videoId, setVideoId] = useState(initial.videoId);
  const [query, setQuery] = useState(initial.query);
  const { accessToken, error: authError, login, logout, loginAvailable } = useAuth();
  const [items, setItems] = useState<CommentThread[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const selectedVideo = parseVideoId(videoId);

  function resetSearch() {
    request.current?.abort();
    request.current = null;
    setIsLoading(false);
    setItems([]);
    setNextPageToken(undefined);
    setError(null);
    setHasSearched(false);
  }
  useEffect(() => {
    resetSearch();
    return () => request.current?.abort();
  }, [accessToken]);
  useEffect(() => {
    const handlePopState = () => {
      const params = getUrlParams();
      setVideoId(params.videoId);
      setQuery(params.query);
      resetSearch();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  async function performSearch(nextPage = false) {
    if (!accessToken || isLoading) return;
    const id = parseVideoId(videoId);
    if (!id) { setError('Enter a valid YouTube video ID or URL.'); return; }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setIsLoading(true);
    setError(null);
    if (!nextPage) { setItems([]); setNextPageToken(undefined); updateUrl(id, query.trim(), true); }
    try {
      const data = await searchComments(id, query.trim(), nextPage ? nextPageToken : undefined, controller.signal);
      if (controller.signal.aborted) return;
      setItems(previous => {
        const combined = nextPage ? [...previous, ...(data.items ?? [])] : data.items ?? [];
        return combined.filter((item, index) => combined.findIndex(other => other.id === item.id) === index);
      });
      setNextPageToken(data.nextPageToken);
      setHasSearched(true);
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(failure instanceof Error ? failure.message : 'Unable to search comments. Please try again.');
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }

  return (
    <div className="appRoot">
      <a className="skipLink" href="#comment-results">Skip to comments</a>
      <header className="masthead pageWidth">
        <div className="brand">
          <span className="brandMark" aria-hidden="true"><ForumOutlined /></span>
          <h1><span>Slpixe</span> Video Comment Search</h1>
        </div>
        {accessToken && <Button variant="outlined" size="small" onClick={logout}>Logout</Button>}
      </header>

      <div className="pageWidth appContent">
        {import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true' && <Alert className="demoNotice" role="note" severity="info">Demo mode: login and comments are simulated.</Alert>}

        <section className="searchPanel" aria-label="Search video comments">
          <form className="searchForm" onSubmit={event => { event.preventDefault(); void performSearch(); }}>
            <TextField className="videoField" size="small" type="text" label="YouTube video ID or URL" placeholder="Paste a YouTube link or video ID" value={videoId} required
              onChange={event => { resetSearch(); setVideoId(event.target.value); }}
              InputLabelProps={{ shrink: true }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SmartDisplayOutlined /></InputAdornment> }} />
            <TextField className="queryField" size="small" type="search" label="Search term" placeholder="Leave blank to browse" value={query}
              onChange={event => { resetSearch(); setQuery(event.target.value); }}
              InputLabelProps={{ shrink: true }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }} />
            <Button className="searchButton" variant="contained" type="submit" startIcon={<SearchRounded />} disabled={isLoading || !accessToken}>Search</Button>
          </form>
          {!accessToken && <div className="loginPrompt">
            <p>Please log in with Google to search comments.</p>
            <Button variant="outlined" disabled={!loginAvailable} onClick={login}>Login with Google</Button>
          </div>}
        </section>

        {authError && <Alert severity="error" className="searchAlert">{authError}</Alert>}
        <main id="comment-results" tabIndex={-1} className="searchResultsList" aria-label="Comment search results" aria-busy={isLoading}>
          <div className="resultsContent">
            {accessToken && error && <Alert severity="error" className="searchAlert">{error}</Alert>}
            {accessToken && items.length > 0 && <>
              <div className="resultsHeader"><div className="resultsSummary"><p role="status">{items.length} {items.length === 1 ? 'comment' : 'comments'} loaded</p>
                {selectedVideo && <a className="videoLink" href={`https://www.youtube.com/watch?v=${selectedVideo}`} target="_blank" rel="noopener noreferrer">Open on YouTube <OpenInNewRounded /></a>}
              </div><CopySearchLink /></div>
              <div className="commentList"><YoutubeList items={items} /></div>
            </>}
            {accessToken && isLoading && <div className="loadingState"><CircularProgress size={24} aria-label="Loading comments" /><p>Loading comments…</p></div>}
            {accessToken && !isLoading && !error && items.length === 0 && <div className="emptyState">
              {hasSearched && <h2>No results found</h2>}
              <p>{hasSearched ? 'Try a different search term, or leave it blank to browse all comments.' : 'Enter a video and search its comments.'}</p>
            </div>}
            {accessToken && nextPageToken && <div className="pagination"><Button variant="outlined" disabled={isLoading} onClick={() => void performSearch(true)}>Load more comments</Button></div>}
          </div>
        </main>
      </div>
      <Policy />
    </div>
  );
}
export default VideoCommentsSearch;
