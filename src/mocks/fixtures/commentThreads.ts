import type { CommentThreadsResponse } from '../../types/youtube';

export const commentThreadsFixture: CommentThreadsResponse = {
  kind: "youtube#commentThreadListResponse",
  pageInfo: {
    totalResults: 3,
    resultsPerPage: 30,
  },
  nextPageToken: "mockNextPageToken123",
  items: [
    {
      kind: "youtube#commentThread",
      id: "comment1",
      snippet: {
        totalReplyCount: 2,
        topLevelComment: {
          id: "comment1_tl",
          snippet: {
            textOriginal: "This is the first comment",
            authorDisplayName: "User One",
            likeCount: 5,
            publishedAt: "2024-01-01T00:00:00.000Z",
          },
        },
      },
      replies: {
        comments: [
          {
            id: "comment1_r1",
            snippet: {
              textOriginal: "Great point!",
              authorDisplayName: "User Four",
              likeCount: 1,
              publishedAt: "2024-01-01T12:00:00.000Z",
            },
          },
          {
            id: "comment1_r2",
            snippet: {
              textOriginal: "I agree with this!",
              authorDisplayName: "User Five",
              likeCount: 0,
              publishedAt: "2024-01-01T18:00:00.000Z",
            },
          },
        ],
      },
    },
    {
      kind: "youtube#commentThread",
      id: "comment2",
      snippet: {
        totalReplyCount: 0,
        topLevelComment: {
          id: "comment2_tl",
          snippet: {
            textOriginal: "Another great video!",
            authorDisplayName: "User Two",
            likeCount: 2,
            publishedAt: "2024-01-02T00:00:00.000Z",
          },
        },
      },
    },
    {
      kind: "youtube#commentThread",
      id: "comment3",
      snippet: {
        totalReplyCount: 1,
        topLevelComment: {
          id: "comment3_tl",
          snippet: {
            textOriginal: "Keep up the good work",
            authorDisplayName: "User Three",
            likeCount: 0,
            publishedAt: "2024-01-03T00:00:00.000Z",
          },
        },
      },
      replies: {
        comments: [
          {
            id: "comment3_r1",
            snippet: {
              textOriginal: "Thanks for the kind words!",
              authorDisplayName: "Channel Owner",
              likeCount: 3,
              publishedAt: "2024-01-03T09:00:00.000Z",
            },
          },
        ],
      },
    },
  ],
};
