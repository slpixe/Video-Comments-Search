import { useState, useEffect, useRef } from "react";
import { Alert, Button, Collapse, CircularProgress, useMediaQuery } from "@mui/material";
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { CommentThread, Reply } from "../types/youtube";

import { listReplies } from '../api/youtube';

const countFormat = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });

interface Props {
  item: CommentThread;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CommentItem({ item }: Props) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesFetched, setRepliesFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const { topLevelComment, totalReplyCount } = item.snippet;
  const { textOriginal, authorDisplayName, likeCount, publishedAt } =
    topLevelComment.snippet;
  const hasReplies = totalReplyCount > 0;

  async function fetchReplies(nextPage = false): Promise<void> {
    if (repliesLoading || (repliesFetched && !nextPage && !error)) return;
    const controller = new AbortController();
    request.current = controller;
    setRepliesLoading(true);
    setError(null);
    try {
      const data = await listReplies(topLevelComment.id, nextPage ? nextPageToken : undefined, controller.signal);
      if (controller.signal.aborted) return;
      setReplies(previous => nextPage ? [...previous, ...(data.items ?? [])] : data.items ?? []);
      setNextPageToken(data.nextPageToken);
      setRepliesFetched(true);
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(failure instanceof Error ? failure.message : 'Unable to load replies.');
    } finally {
      if (!controller.signal.aborted) setRepliesLoading(false);
    }
  }

  function toggleExpanded(): void {
    const next = !expanded;
    setExpanded(next);
    if (next) void fetchReplies(Boolean(error && nextPageToken));
  }

  return (
    <article className="commentItem" aria-label={`Comment by ${authorDisplayName}`}>
      <div className="commentItem__content">
        <div className="commentItem__body">
          <div className="commentItem__text">{textOriginal}</div>
          <div className="commentItem__meta">
            <span className="commentItem__author" title={authorDisplayName}>{authorDisplayName}</span>
            <time className="commentItem__date" dateTime={publishedAt} title={new Date(publishedAt).toLocaleString()}>{formatDate(publishedAt)}</time>
            <span className="commentItem__stat" aria-label={`${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`} title={`${likeCount.toLocaleString()} ${likeCount === 1 ? 'like' : 'likes'}`}>
              <ThumbUpOutlinedIcon fontSize="inherit" />
              {countFormat.format(likeCount)}
            </span>
            {hasReplies ? (
              <button
                type="button"
                className="commentItem__stat commentItem__replyToggle"
                onClick={toggleExpanded}
                aria-label={expanded ? "Hide replies" : "Show replies"}
                aria-expanded={expanded}
                aria-controls={`replies-${item.id}`}
              >
                {expanded ? <ExpandLessIcon fontSize="inherit" /> : <ExpandMoreIcon fontSize="inherit" />}
                <span>{countFormat.format(totalReplyCount)} {totalReplyCount === 1 ? 'reply' : 'replies'}</span>
              </button>
            ) : <span className="commentItem__noReplies" aria-label="No replies">—</span>}
          </div>
        </div>

        {hasReplies && (
          <Collapse in={expanded} timeout={reducedMotion ? 0 : 'auto'}>
            <div className="commentItem__replies" id={`replies-${item.id}`}>
              {error && <Alert severity="error">{error}<Button onClick={() => void fetchReplies(Boolean(nextPageToken))}>Retry replies</Button></Alert>}
              {repliesLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 8 }}>
                  <CircularProgress size={20} aria-label="Loading replies" />
                </div>
              ) : (
                replies.map((reply) => (
                  <article key={reply.id} className="replyItem" aria-label={`Reply by ${reply.snippet.authorDisplayName}`}>
                    <div className="replyItem__body">
                      <div className="replyItem__text">{reply.snippet.textOriginal}</div>
                      <div className="replyItem__meta">
                        <span className="replyItem__author" title={reply.snippet.authorDisplayName}>{reply.snippet.authorDisplayName}</span>
                        <time className="commentItem__date" dateTime={reply.snippet.publishedAt} title={new Date(reply.snippet.publishedAt).toLocaleString()}>{formatDate(reply.snippet.publishedAt)}</time>
                        <span className="commentItem__stat" aria-label={`${reply.snippet.likeCount} ${reply.snippet.likeCount === 1 ? 'like' : 'likes'}`} title={`${reply.snippet.likeCount.toLocaleString()} ${reply.snippet.likeCount === 1 ? 'like' : 'likes'}`}>
                          <ThumbUpOutlinedIcon fontSize="inherit" />
                          {countFormat.format(reply.snippet.likeCount)}
                        </span>
                        <span className="replyItem__threadSpacer" aria-hidden="true" />
                      </div>
                    </div>
                  </article>
                ))
              )}
              {nextPageToken && !error && <Button disabled={repliesLoading} onClick={() => void fetchReplies(true)}>Load more replies</Button>}
            </div>
          </Collapse>
        )}
      </div>
    </article>
  );
}

export default CommentItem;
