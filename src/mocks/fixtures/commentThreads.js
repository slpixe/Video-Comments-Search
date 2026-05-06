export const commentThreadsFixture = {
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
        topLevelComment: {
          snippet: {
            textOriginal: "This is the first comment",
            authorDisplayName: "User One",
            likeCount: 5,
            publishedAt: "2024-01-01T00:00:00.000Z",
          },
        },
      },
    },
    {
      kind: "youtube#commentThread",
      id: "comment2",
      snippet: {
        topLevelComment: {
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
        topLevelComment: {
          snippet: {
            textOriginal: "Keep up the good work",
            authorDisplayName: "User Three",
            likeCount: 0,
            publishedAt: "2024-01-03T00:00:00.000Z",
          },
        },
      },
    },
  ],
};
