export interface CommentSnippet {
  textOriginal: string;
  authorDisplayName: string;
  likeCount: number;
  publishedAt: string;
}

export interface TopLevelComment {
  id: string;
  snippet: CommentSnippet;
}

export interface Reply {
  id: string;
  snippet: CommentSnippet;
}

export interface CommentThread {
  kind: 'youtube#commentThread';
  id: string;
  snippet: {
    topLevelComment: TopLevelComment;
    totalReplyCount: number;
  };
  replies?: {
    comments: Reply[];
  };
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

export interface CommentThreadsResponse {
  kind: string;
  items: CommentThread[];
  nextPageToken?: string;
  pageInfo: PageInfo;
}
