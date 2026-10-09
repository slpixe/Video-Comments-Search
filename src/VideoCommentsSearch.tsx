import { useState, useEffect, useRef } from 'react';
import { Alert, Button, CircularProgress, InputAdornment, Stack, TextField, Typography, Box } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import YoutubeList from './components/youtubeList/YoutubeList';
import Policy from './components/TermsAndPolicy';
import { useAuth } from './auth/AuthProvider';
import { parseVideoId, searchComments, YouTubeApiError } from './api/youtube';
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
  const { accessToken, error: authError, login, logout, expire, loginAvailable } = useAuth();
  const [items, setItems] = useState<CommentThread[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

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
      const data = await searchComments(id, query.trim(), accessToken, nextPage ? nextPageToken : undefined, controller.signal);
      if (controller.signal.aborted) return;
      setItems(previous => {
        const combined = nextPage ? [...previous, ...(data.items ?? [])] : data.items ?? [];
        return combined.filter((item, index) => combined.findIndex(other => other.id === item.id) === index);
      });
      setNextPageToken(data.nextPageToken);
      setHasSearched(true);
    } catch (failure) {
      if (controller.signal.aborted) return;
      if (failure instanceof YouTubeApiError && failure.status === 401) expire();
      else setError(failure instanceof Error ? failure.message : 'Unable to search comments. Please try again.');
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  }

  return (
    <div className="appRoot">
      <div className="appHeader">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>Slpixe Video Comment Search</Typography>
          {accessToken && <Button variant="outlined" size="small" onClick={logout}>Logout</Button>}
        </Box>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Search and browse public comments and replies on YouTube videos. Sign in with Google to authorize read-only YouTube access.</Typography>
        {import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true' && <Alert role="note" severity="info" sx={{ mb: 2 }}>Demo mode: login and comments are simulated.</Alert>}
        <form onSubmit={event => { event.preventDefault(); void performSearch(); }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
            <TextField type="text" label="YouTube video ID or URL" helperText="Paste a video link or ID, e.g. kJQP7kiw5Fk" value={videoId} required
              onChange={event => { resetSearch(); setVideoId(event.target.value); }}
              autoFocus size="small" sx={{ minWidth: 180, flex: 1 }} />
            <TextField type="search" label="Search term" helperText="Leave blank to browse comments" value={query}
              onChange={event => { resetSearch(); setQuery(event.target.value); }}
              size="small" sx={{ minWidth: 200, flex: 1 }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} />
            <Button variant="contained" type="submit" disabled={isLoading || !accessToken} sx={{ height: 40 }}>Search</Button>
          </Stack>
        </form>
      </div>
      <main className="searchResultsList" aria-label="Comment search results" aria-busy={isLoading}>
        {authError && <Alert severity="error" sx={{ m: 2 }}>{authError}</Alert>}
        {!accessToken ? (
          <Stack className="emptyState" alignItems="center" spacing={1.5}>
            <Typography color="text.secondary">Please log in with Google to search comments.</Typography>
            <Button variant="contained" size="small" disabled={!loginAvailable} onClick={login}>Login with Google</Button>
          </Stack>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
            {items.length > 0 && <><Typography role="status" sx={{ p: 2 }}>{items.length} comments loaded</Typography><YoutubeList items={items} accessToken={accessToken} /></>}
            {isLoading && <Stack className="emptyState" alignItems="center"><CircularProgress aria-label="Loading comments" /></Stack>}
            {!isLoading && !error && items.length === 0 && <div className="emptyState"><Typography color="text.secondary">{hasSearched ? 'No results found' : 'Enter a video and search its comments.'}</Typography></div>}
            {nextPageToken && <Box sx={{ p: 2, textAlign: 'center' }}><Button variant="outlined" disabled={isLoading} onClick={() => void performSearch(true)}>Load more comments</Button></Box>}
          </>
        )}
      </main>
      <Policy />
    </div>
  );
}
export default VideoCommentsSearch;
