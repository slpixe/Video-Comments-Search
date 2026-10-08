import { useState, useEffect, useRef } from "react";
import { Alert, Button, Collapse, CircularProgress, Tooltip } from "@mui/material";
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { CommentThread, Reply } from "../types/youtube";

import { listReplies, YouTubeApiError } from '../api/youtube';
import { useAuth } from '../auth/AuthProvider';

interface Props {
  item: CommentThread;
  index: number;
  accessToken: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CommentItem({ item, index, accessToken }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesFetched, setRepliesFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string>();
  const request = useRef<AbortController | null>(null);
  const { expire } = useAuth();
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
      const data = await listReplies(topLevelComment.id, accessToken, nextPage ? nextPageToken : undefined, controller.signal);
      if (controller.signal.aborted) return;
      setReplies(previous => nextPage ? [...previous, ...(data.items ?? [])] : data.items ?? []);
      setNextPageToken(data.nextPageToken);
      setRepliesFetched(true);
    } catch (failure) {
      if (controller.signal.aborted) return;
      if (failure instanceof YouTubeApiError && failure.status === 401) expire();
      else setError(failure instanceof Error ? failure.message : 'Unable to load replies.');
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
    <div className={`commentItem${index % 2 === 1 ? " commentItem--alt" : ""}`}>
      <div className="commentItem__body">
        <div className="commentItem__text">{textOriginal}</div>
        <div className="commentItem__meta">
          <span className="commentItem__author">{authorDisplayName}</span>
          {likeCount > 0 && (
            <span className="commentItem__stat">
              <ThumbUpOutlinedIcon fontSize="inherit" />
              {likeCount}
            </span>
          )}
          {hasReplies && (
            <Tooltip title={expanded ? "Hide replies" : `${totalReplyCount} repl${totalReplyCount === 1 ? "y" : "ies"}`}>
              <button
                type="button"
                className="commentItem__stat commentItem__replyToggle"
                onClick={toggleExpanded}
                aria-label={expanded ? "Hide replies" : "Show replies"}
                aria-expanded={expanded}
              >
                <ChatBubbleOutlineIcon fontSize="inherit" />
                <span className="commentItem__replyCount">{totalReplyCount}</span>
                {expanded ? (
                  <ExpandLessIcon fontSize="inherit" />
                ) : (
                  <ExpandMoreIcon fontSize="inherit" />
                )}
              </button>
            </Tooltip>
          )}
          <span className="commentItem__date">{formatDate(publishedAt)}</span>
        </div>
      </div>

      {hasReplies && (
        <Collapse in={expanded}>
          <div className="commentItem__replies">
            {error && <Alert severity="error">{error}<Button onClick={() => void fetchReplies(Boolean(nextPageToken))}>Retry replies</Button></Alert>}
            {repliesLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 8 }}>
                <CircularProgress size={20} aria-label="Loading replies" />
              </div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="replyItem">
                  <div className="replyItem__body">
                    <div className="replyItem__text">{reply.snippet.textOriginal}</div>
                    <div className="replyItem__meta">
                      <span className="replyItem__author">{reply.snippet.authorDisplayName}</span>
                      {reply.snippet.likeCount > 0 && (
                        <span className="commentItem__stat">
                          <ThumbUpOutlinedIcon fontSize="inherit" />
                          {reply.snippet.likeCount}
                        </span>
                      )}
                      <span className="commentItem__date">{formatDate(reply.snippet.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {nextPageToken && !error && <Button disabled={repliesLoading} onClick={() => void fetchReplies(true)}>Load more replies</Button>}
          </div>
        </Collapse>
      )}
    </div>
  );
}

export default CommentItem;
