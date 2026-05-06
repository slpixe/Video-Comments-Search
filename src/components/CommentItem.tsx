import { useState } from "react";
import { Collapse, CircularProgress, Tooltip } from "@mui/material";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import type { CommentThread, Reply, CommentsListResponse } from "../types/youtube";

const youtubeApi = "https://www.googleapis.com/youtube/v3";

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
  const { topLevelComment, totalReplyCount } = item.snippet;
  const { textOriginal, authorDisplayName, likeCount, publishedAt } =
    topLevelComment.snippet;
  const hasReplies = totalReplyCount > 0;

  function fetchReplies(): void {
    if (repliesFetched) return;
    setRepliesLoading(true);
    const params = new URLSearchParams({
      part: "snippet",
      parentId: topLevelComment.id,
      maxResults: "100",
    });
    fetch(`${youtubeApi}/comments?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json() as Promise<CommentsListResponse>)
      .then((data) => {
        setReplies(data.items ?? []);
        setRepliesFetched(true);
      })
      .finally(() => {
        setRepliesLoading(false);
      });
  }

  function toggleExpanded(): void {
    const next = !expanded;
    setExpanded(next);
    if (next) fetchReplies();
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
              <span
                className="commentItem__stat commentItem__replyToggle"
                onClick={toggleExpanded}
                role="button"
                aria-label={expanded ? "Hide replies" : "Show replies"}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" || e.key === " " ? toggleExpanded() : undefined}
              >
                <ChatBubbleOutlineIcon fontSize="inherit" />
                <span className="commentItem__replyCount">{totalReplyCount}</span>
                {expanded ? (
                  <ExpandLessIcon fontSize="inherit" />
                ) : (
                  <ExpandMoreIcon fontSize="inherit" />
                )}
              </span>
            </Tooltip>
          )}
          <span className="commentItem__date">{formatDate(publishedAt)}</span>
        </div>
      </div>

      {hasReplies && (
        <Collapse in={expanded}>
          <div className="commentItem__replies">
            {repliesLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 8 }}>
                <CircularProgress size={20} />
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
          </div>
        </Collapse>
      )}
    </div>
  );
}

export default CommentItem;
