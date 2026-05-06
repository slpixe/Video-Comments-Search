import { http, HttpResponse } from "msw";
import { commentThreadsFixture } from "./fixtures/commentThreads";
import type { CommentsListResponse } from "../types/youtube";

const repliesByParentId: Record<string, CommentsListResponse> = {
  comment1_tl: {
    kind: "youtube#commentListResponse",
    pageInfo: { totalResults: 2, resultsPerPage: 20 },
    items: commentThreadsFixture.items[0].replies?.comments ?? [],
  },
  comment3_tl: {
    kind: "youtube#commentListResponse",
    pageInfo: { totalResults: 1, resultsPerPage: 20 },
    items: commentThreadsFixture.items[2].replies?.comments ?? [],
  },
};

export const handlers = [
  http.get(
    "https://www.googleapis.com/youtube/v3/commentThreads",
    () => {
      return HttpResponse.json(commentThreadsFixture);
    }
  ),
  http.get(
    "https://www.googleapis.com/youtube/v3/comments",
    ({ request }) => {
      const url = new URL(request.url);
      const parentId = url.searchParams.get("parentId") ?? "";
      const response = repliesByParentId[parentId] ?? {
        kind: "youtube#commentListResponse",
        pageInfo: { totalResults: 0, resultsPerPage: 20 },
        items: [],
      };
      return HttpResponse.json(response);
    }
  ),
];
